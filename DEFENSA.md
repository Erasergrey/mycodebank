# Guía de defensa — MyCodeBank

## 1. Resumen del proyecto

MyCodeBank es una aplicación web educativa desarrollada con React, Vite y Firebase. Simula un mini banco digital donde un usuario puede registrarse, iniciar sesión, ver su saldo en tiempo real, transferir dinero a otros usuarios, revisar su historial de movimientos y realizar depósitos o retiros simulados.

El objetivo principal del proyecto no es crear una banca real, sino demostrar el uso de React con programación reactiva, manejo correcto de eventos, formularios controlados, Firebase Authentication y Cloud Firestore.

---

## 2. Tecnologías utilizadas

- React.
- Vite.
- Firebase Authentication.
- Cloud Firestore.
- Firestore Rules.
- CSS.
- Oxlint.

React se encarga de construir la interfaz mediante componentes.  
Vite permite levantar el proyecto en desarrollo y generar el build final.  
Firebase Authentication administra el registro, login, persistencia de sesión y logout.  
Cloud Firestore almacena usuarios, saldos y movimientos.  
Firestore Rules controla permisos, validaciones y seguridad de datos.

---

## 3. Arquitectura general

La aplicación está separada por responsabilidades:

```text
src/
  components/  → componentes visuales reutilizables
  hooks/       → lógica reactiva y suscripciones
  pages/       → vistas principales
  services/    → conexión con Firebase y operaciones de datos
  styles/      → estilos CSS
  utils/       → funciones auxiliares

La idea principal es que los componentes no trabajen directamente con Firebase en todas partes.
La comunicación con Authentication y Firestore se concentra en services, mientras que la lógica de suscripción se maneja mediante hooks.

Esto permite que el proyecto sea más ordenado, más fácil de explicar y más fácil de mantener.

## 4. Separación entre Front-End y Back-End

El front-end está desarrollado con React.

El backend no es un servidor propio en Node, PHP o Laravel. En este proyecto el backend está delegado a Firebase como Backend as a Service.

Firebase cumple funciones de backend:

Authentication administra usuarios y sesiones.
Firestore almacena perfiles, saldos y movimientos.
Firestore Rules valida permisos y operaciones.

La separación queda así:

Usuario
  ↓
React Front-End
  ↓
Services / Hooks
  ↓
Firebase Authentication + Cloud Firestore

En una aplicación financiera real, la lógica crítica de transferencias debería ejecutarse en un backend propio o en Cloud Functions. Para esta evaluación, Firebase permite demostrar integración con un backend en la nube y programación reactiva.

5. Flujo de autenticación

Cuando el usuario se registra:

Se valida el formulario en React.
Se crea el usuario en Firebase Authentication.
Se crea su documento en Firestore dentro de users/{uid}.
Se crea un registro auxiliar en userDirectory/{uid} para buscar destinatarios.
El usuario queda autenticado y puede acceder a la aplicación.

El saldo inicial es de 100000, tal como exige la pauta.

Si falla la creación del perfil en Firestore después de crear la cuenta en Authentication, el código intenta eliminar el usuario recién creado con deleteUser. Esto evita dejar cuentas incompletas.

6. ¿Por qué se usa onAuthStateChanged?

onAuthStateChanged permite saber si existe una sesión activa.

Se usa porque Firebase puede recordar la sesión aunque el usuario recargue la página. Entonces React no debe asumir manualmente si hay usuario o no, sino esperar la respuesta de Firebase.

Flujo:

App carga
→ onAuthStateChanged revisa sesión
→ si hay usuario, muestra la app privada
→ si no hay usuario, muestra login/registro

Esto permite proteger las vistas privadas y manejar correctamente la persistencia de sesión.

7. Dashboard y saldo en tiempo real

El saldo no se guarda como dato definitivo en React ni en localStorage.

La fuente de verdad es Firestore.

El dashboard se suscribe al documento:

users/{uid}

mediante onSnapshot.

Esto permite que, si el saldo cambia por una transferencia, depósito o retiro, la interfaz se actualice automáticamente sin presionar F5 ni usar un botón de actualizar.

8. ¿Por qué se usa onSnapshot?

onSnapshot crea una suscripción en tiempo real a Firestore.

Se usa para:

Perfil del usuario.
Saldo.
Historial de movimientos.

Ventaja:

Firestore cambia
→ onSnapshot recibe el nuevo dato
→ React actualiza el estado
→ la UI se vuelve a renderizar automáticamente

Esto cumple el requisito de programación reactiva de la evaluación.

9. ¿Por qué se usa unsubscribe?

Cada vez que se crea una suscripción con onSnapshot, Firebase deja un listener activo.

Si no se limpia con unsubscribe, pueden ocurrir problemas:

Lecturas duplicadas.
Fugas de memoria.
Datos cruzados entre usuarios.
Más consumo de Firestore.
Errores al cerrar sesión.

Por eso cada useEffect que crea una suscripción retorna una función de limpieza.

Ejemplo conceptual:

useEffect(() => {
  const unsubscribe = onSnapshot(ref, callback)

  return () => {
    unsubscribe()
  }
}, [uid])
10. Transferencias

El usuario puede transferir dinero a otro usuario usando su correo.

Antes de tocar Firestore, la aplicación valida:

Que el monto sea mayor a 0.
Que el monto sea un número válido.
Que exista un destinatario.
Que el usuario no se transfiera a sí mismo.
Que tenga saldo suficiente.
Que no se haga doble submit.
Que la descripción no exceda el límite permitido.

La transferencia descuenta al emisor, abona al receptor y crea un movimiento asociado.

11. ¿Por qué se usa runTransaction?

Se usa runTransaction porque una transferencia afecta más de un documento:

Usuario emisor.
Usuario receptor.
Documento del movimiento.

Si una operación falla a la mitad, podría quedar un saldo descontado sin abonar al receptor. Con una transacción, Firestore asegura que todas las operaciones se completen juntas o no se aplique ninguna.

Flujo:

Leer saldo emisor
Leer saldo receptor
Validar saldo suficiente
Actualizar emisor
Actualizar receptor
Crear movimiento
Confirmar transacción

Esto evita inconsistencias en operaciones simultáneas.

12. Historial de movimientos

El historial muestra movimientos enviados y recibidos.

Para obtenerlos se usan consultas a Firestore por:

emisorUid
receptorUid

Luego la aplicación une los resultados, evita duplicados y ordena por fecha descendente.

Cada movimiento muestra:

Fecha.
Contraparte.
Monto.
Tipo de movimiento.
Estado.
Descripción si existe.

El historial también usa onSnapshot, por lo que se actualiza automáticamente cuando se crea un nuevo movimiento.

13. Depósitos y retiros simulados

Además de los requisitos obligatorios, el proyecto incluye operaciones simuladas:

Depósito.
Retiro.

Estas operaciones no representan dinero real. Solo modifican el saldo académico del usuario y crean movimientos en Firestore.

Esta funcionalidad corresponde a la bonificación opcional de la pauta.

14. Filtros del historial

El historial permite filtrar o buscar movimientos por distintos criterios.

Esto también corresponde a la bonificación opcional, ya que mejora la experiencia del usuario y facilita revisar movimientos enviados, recibidos, depósitos y retiros.

15. Manejo de eventos

Los formularios usan buenas prácticas de React:

Inputs controlados con useState.
Handlers nombrados.
event.preventDefault() en formularios.
Validación antes de llamar a Firebase.
Botones deshabilitados durante operaciones.
Mensajes visibles para el usuario.
Prevención de doble submit.

Esto evita recargas de página, operaciones duplicadas y errores silenciosos.

16. ¿Por qué no se manipula el DOM directamente?

En React la interfaz debe depender del estado. Por eso no se usan funciones como document.getElementById dentro de componentes para cambiar datos visuales.

La lógica correcta es:

Evento del usuario
→ actualiza estado
→ React renderiza la interfaz

Esto mantiene la aplicación predecible y fácil de mantener.

17. Variables de entorno

Las variables de Firebase están en .env local y el repositorio solo incluye .env.example.

Esto evita subir configuración real al repositorio.

El archivo .env.example permite saber qué variables se necesitan sin exponer valores reales.

En una app React/Vite, las variables VITE_ usadas en el front-end quedan incorporadas en el build final. Eso es normal. La seguridad real depende de Firestore Rules, dominios autorizados y configuración de Firebase, no de esconder la API Key como si fuera una contraseña privada de servidor.

18. Reglas de Firestore

Las reglas validan:

Que el usuario esté autenticado.
Que los perfiles se creen con el UID correcto.
Que el saldo inicial sea el esperado.
Que los movimientos solo los lean sus participantes.
Que los movimientos no se puedan editar o eliminar libremente.
Que las operaciones financieras actualicen saldo y movimiento de forma consistente.
Que depósitos y retiros simulados tengan límites.

También se usa getAfter() para validar el estado final de documentos dentro de una misma operación.

19. Modelo de datos
users/{uid}

Guarda la información principal del usuario:

nombre
email
emailNormalizado
saldo
creadoEn
actualizadoEn
ultimaTransferenciaId
userDirectory/{uid}

Sirve para buscar destinatarios por correo sin exponer innecesariamente todos los datos bancarios.

uid
nombre
emailNormalizado
movimientos/{id}

Guarda las transferencias, depósitos y retiros.

operationId
emisorUid
receptorUid
emisorNombre
receptorNombre
emisorEmail
receptorEmail
monto
descripcion
tipo
estado
fecha
20. Limitaciones del proyecto

MyCodeBank es una aplicación educativa.

No está preparada para producción financiera real porque:

La lógica crítica se ejecuta desde el cliente.
No existe backend propio ni Cloud Functions.
No hay integración con bancos reales.
No hay Webpay, Mercado Pago ni tarjetas.
Depósitos y retiros son simulados.
Firebase se usa como backend administrado para fines académicos.

En producción, las transferencias deberían validarse en un backend seguro y no depender solo del cliente.

21. Qué mejoraría con más tiempo

Con más tiempo mejoraría:

Implementar Cloud Functions para transferencias.
Agregar App Check.
Mejorar roles y auditoría.
Agregar pruebas automatizadas.
Agregar recuperación de contraseña.
Mejorar accesibilidad avanzada.
Crear reportes o comprobantes de transferencia.
Agregar validación más estricta del modelo de datos.
Agregar panel administrativo.
Agregar logs de auditoría.
22. Uso de inteligencia artificial

Se utilizó IA como apoyo para estructurar componentes, revisar validaciones, analizar errores y preparar documentación técnica.

La IA ayudó principalmente en:

Planificación por etapas.
Revisión de requisitos de la pauta.
Organización de servicios y componentes.
Corrección de errores.
Preparación de la defensa.

Todo el código integrado fue revisado, probado y adaptado antes de incorporarlo al proyecto. La responsabilidad final del funcionamiento y explicación del código es del estudiante.

23. Bonificación

El proyecto implementa funcionalidades opcionales que pueden optar a bonificación:

Depósitos simulados.
Retiros simulados.
Filtros y búsqueda en el historial.
Diseño responsive trabajado.

Estas funcionalidades no reemplazan los requisitos obligatorios, sino que los complementan.

Frase para defensa:

Además de cumplir RF1 a RF5, agregué depósito y retiro simulado, junto con filtros de historial. Estas funciones aparecen como opcionales en la pauta, por eso las considero parte de la bonificación.

24. Preguntas probables del profesor
¿Qué es MyCodeBank?

Es una SPA educativa hecha con React y Firebase que simula una banca digital básica con login, saldo en tiempo real, transferencias e historial.

¿Dónde está el backend?

El backend está delegado a Firebase. Authentication maneja usuarios y Firestore maneja datos. Las reglas de Firestore controlan permisos.

¿Por qué usaste Firebase?

Porque permite integrar autenticación, base de datos en tiempo real y reglas de seguridad sin crear un backend propio, lo cual calza con el objetivo de la evaluación.

¿Qué hace onSnapshot?

Escucha cambios en Firestore en tiempo real y actualiza la interfaz automáticamente.

¿Qué pasa si no haces unsubscribe?

Quedan listeners activos, se duplican lecturas y pueden aparecer fugas de memoria o datos de otro usuario.

¿Por qué el saldo no se guarda solo en useState?

Porque useState es temporal. El saldo real debe vivir en Firestore, y React solo debe mostrarlo mediante suscripción.

¿Por qué usaste runTransaction?

Porque una transferencia modifica varios documentos y debe ser atómica. Si algo falla, no debe quedar una operación parcial.

¿Cómo evitas el doble submit?

Uso estados de carga, botones deshabilitados y validaciones para impedir enviar el formulario dos veces.

¿Qué validaciones tiene una transferencia?

Monto mayor a cero, saldo suficiente, destinatario existente, no autotransferencia y descripción limitada.

¿Qué harías distinto en producción?

Movería las operaciones críticas a Cloud Functions o a un backend propio, agregaría App Check, auditoría y seguridad más estricta.

¿La Firebase API Key es una contraseña?

No. En apps web Firebase, la API Key identifica el proyecto, pero la seguridad real depende de reglas, dominios autorizados y configuración del backend.

¿Cómo se protege una vista privada?

La app observa la sesión con onAuthStateChanged. Si no hay usuario, solo muestra login/registro.

¿Qué colección guarda los usuarios?

users/{uid} guarda nombre, email, email normalizado, saldo y fechas.

¿Para qué sirve userDirectory?

Sirve para buscar destinatarios por correo sin depender directamente de toda la información del perfil bancario.

¿Qué colección guarda movimientos?

movimientos/{id} guarda transferencias, depósitos y retiros simulados.

¿Cómo sabes si un movimiento es enviado o recibido?

Comparo el UID autenticado con emisorUid y receptorUid.

¿Por qué usaste variables de entorno?

Para no dejar configuración real escrita directamente en el código fuente versionado.

¿Qué parte fue más difícil?

La parte más delicada fue coordinar transferencias, saldo e historial en tiempo real manteniendo validaciones y limpieza de suscripciones.
