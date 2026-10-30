# TariGuard · Power Group

Kanban FLL del Liceo 6 de Rivera. Sitio estático en GitHub Pages, acceso con Google y datos privados compartidos en Firestore. No depende de ChatGPT para funcionar.

## Acceso
Entra con Google. Si la cuenta no está autorizada, pulsa **Solicitar acceso**. El administrador ve un aviso y un contador de solicitudes pendientes, actualizados en tiempo real, y puede permitir edición, dar solo lectura o rechazar desde **Accesos**. Al aprobar, el tablero se abre automáticamente para el solicitante.

Las solicitudes guardan el nombre, el correo verificado de Google y la fecha en una colección privada de Firestore. Cada persona solo puede consultar su propia solicitud; solo el administrador puede ver la bandeja y resolverla. El código de usuario sigue disponible como alternativa para la autorización manual. No se envían correos ni notificaciones fuera de la página.

## Datos
Este repositorio contiene código y logos, no el respaldo privado del tablero ni credenciales de administración. La configuración Firebase web es pública por diseño. El acceso real lo controlan firestore.rules.

Usa Exportar respaldo para conservar copias locales. Firestore verifica la revisión al guardar y rechaza escrituras simultáneas que podrían sobrescribirse.

## Publicación
GitHub Pages sirve main desde la raíz. Firebase proyecto tariguard-powergroup-fll, plan Spark. Las cuotas gratuitas tienen límites. No activar facturación para esta instalación.

## Desarrollo
Sirve esta carpeta con un servidor estático. Los dominios permitidos para Firebase Authentication incluyen powergroup-robotica.github.io, marceloprofe.github.io y localhost.

Los logos fueron proporcionados por el docente. La ilustración amazónica es conceptual, generada con IA.
