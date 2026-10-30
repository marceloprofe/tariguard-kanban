import {initializeApp} from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut} from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import {getFirestore,doc,getDoc,onSnapshot,runTransaction,setDoc,getDocs,collection,deleteDoc,serverTimestamp,query,where} from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';
const app=initializeApp({projectId:'tariguard-powergroup-fll',appId:'1:274714948882:web:05c74ddff988a9e5396fcb',apiKey:'AIzaSyANvYrMucht7BFBZbTUk_S-R7fYio-lKDM',authDomain:'tariguard-powergroup-fll.firebaseapp.com',messagingSenderId:'274714948882'});
const auth=getAuth(app),db=getFirestore(app),ref=doc(db,'tariguardBoards','power-group');
export let session={user:null,role:'visitor'};
export async function ready(){await auth.authStateReady();session.user=auth.currentUser;if(session.user){let m=await getDoc(doc(db,'tariguardMembers',session.user.uid));session.role=m.exists()?m.data().role:'visitor'}return session}
export async function login(){const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});await signInWithPopup(auth,provider);location.reload()}
export async function logout(){await signOut(auth);location.reload()}
export async function readBoard(){let r=await getDoc(ref);if(!r.exists())throw Error('El docente todavía no cargó el tablero');return {board:JSON.parse(r.data().payload),revision:r.data().revision}}
export function followBoard(cb,error){return onSnapshot(ref,s=>{if(s.exists())cb({board:JSON.parse(s.data().payload),revision:s.data().revision})},error)}
export async function writeBoard(board,revision){if(!['admin','editor'].includes(session.role))throw Error('Solo las cuentas autorizadas pueden editar');return runTransaction(db,async tx=>{let r=await tx.get(ref);if(!r.exists()||r.data().revision!==revision)throw Error('Otra persona actualizó el tablero. Exporta tu copia y recarga antes de continuar');let next=revision+1;tx.update(ref,{payload:JSON.stringify(board),revision:next});return next})}
export async function members(){let r=await getDocs(collection(db,'tariguardMembers'));return r.docs.map(d=>({uid:d.id,...d.data()}))}
export async function addMember(uid,role){if(!/^[A-Za-z0-9_-]{10,128}$/.test(uid))throw Error('Código de usuario inválido');if(!['editor','viewer'].includes(role))throw Error('Rol inválido');await runTransaction(db,async tx=>{const ref=doc(db,'tariguardAccessRequests',uid),r=await tx.get(ref);tx.set(doc(db,'tariguardMembers',uid),{role,...(r.exists()?{displayName:r.data().displayName,email:r.data().email}:{})});if(r.exists()&&r.data().status==='pending')tx.update(ref,{status:'approved',reviewedAt:serverTimestamp()})})}
export async function removeMember(uid){if(uid===session.user?.uid)throw Error('No puedes quitarte tu acceso de administrador');await deleteDoc(doc(db,'tariguardMembers',uid))}
export async function requestAccess(){
 if(!session.user||session.role!=='visitor')throw Error('Primero inicia sesión con Google');
 const ref=doc(db,'tariguardAccessRequests',session.user.uid);
 await runTransaction(db,async tx=>{
  const current=await tx.get(ref);
  if(current.exists())return;
  tx.set(ref,{displayName:session.user.displayName||'Integrante del equipo',email:session.user.email,status:'pending',requestedAt:serverTimestamp()});
 });
}
export function followOwnRequest(cb,error){return onSnapshot(doc(db,'tariguardAccessRequests',session.user.uid),s=>cb(s.exists()?s.data():null),error)}
export function followMembership(cb,error){return onSnapshot(doc(db,'tariguardMembers',session.user.uid),s=>cb(s.exists()?s.data().role:'visitor'),error)}
export function followRequests(cb,error){return onSnapshot(query(collection(db,'tariguardAccessRequests'),where('status','==','pending')),s=>cb(s.docs.map(d=>({uid:d.id,...d.data()}))),error)}
export async function resolveRequest(uid,decision){
 if(session.role!=='admin')throw Error('Solo el administrador puede resolver solicitudes');
 if(!['editor','viewer','rejected'].includes(decision))throw Error('Permiso inválido');
 if(uid===session.user.uid)throw Error('No puedes cambiar tu propio acceso');
 const ref=doc(db,'tariguardAccessRequests',uid);
 await runTransaction(db,async tx=>{
  const r=await tx.get(ref);
  if(!r.exists()||r.data().status!=='pending')throw Error('Esta solicitud ya fue resuelta.');
  if(decision!=='rejected')tx.set(doc(db,'tariguardMembers',uid),{role:decision,displayName:r.data().displayName,email:r.data().email});
  tx.update(ref,{status:decision==='rejected'?'rejected':'approved',reviewedAt:serverTimestamp()});
 });
}
