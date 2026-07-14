# MyCodeBank - Mini Banco Digital

## Descripcion

MyCodeBank es una SPA educativa construida con React, Vite y Firebase. Permite registrar usuarios, iniciar sesion, consultar saldo en tiempo real, transferir entre cuentas MyCodeBank, revisar historial, realizar depositos simulados y realizar retiros simulados.

MyCodeBank es un proyecto academico. No representa una institucion financiera ni opera con dinero real.

## Demo 

https://erasergrey.github.io/mycodebank/



## Tecnologias

- React 19.
- Vite 8.
- Firebase Authentication.
- Cloud Firestore.
- CSS modular por archivos globales del proyecto.
- Iconos SVG internos en `LayoutIcon`.
- Oxlint para revision estatica.

## Requisitos

- Node.js 20.19 o superior, o Node.js 22.12 o superior.
- npm.
- Proyecto Firebase con Authentication y Cloud Firestore habilitados.

## Instalacion

```bash
git clone <URL_DEL_REPOSITORIO>
cd MyCodeBank
npm install
```

## Variables de entorno

Crear el archivo `.env` desde el ejemplo:

```bash
cp .env.example .env
```

Luego completar las variables del proyecto Firebase:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

No se deben versionar archivos `.env` reales.

## Ejecucion

```bash
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Lint

```bash
npm run lint
```

## Testing unitario

El proyecto incluye pruebas unitarias para la evaluacion de Testing Unitario. La cobertura se enfoca en las zonas solicitadas por la pauta: validaciones puras, formulario de transferencia, login, historial y mocks de servicios.

### Instalacion y ejecucion

```bash
npm install
npm test
npm run test:run
npm run coverage
```

### Stack de testing

- Vitest como runner de pruebas para Vite.
- React Testing Library para probar componentes desde el comportamiento visible.
- `@testing-library/user-event` para simular interacciones de usuario.
- jsdom como entorno de navegador para los tests.
- `@testing-library/jest-dom` para matchers de DOM.
- `@vitest/coverage-v8` para reporte de cobertura.

### Que se testeo

- Validaciones puras de transferencia en `src/utils/validaciones.js`.
- Formulario de transferencia con React Testing Library y userEvent.
- Formulario de login con validaciones, errores y estado de carga.
- Historial de movimientos con datos mockeados.
- Mock explicito de `authService` con `vi.mock`.

### Refactors para testabilidad

- Se extrajo `TransferForm` como componente testeable sin Firebase.
- Se ajusto `LoginForm` para recibir `onLogin` como prop.
- Se extrajo `TransactionHistory` como componente presentacional sin Firebase.
- Se separaron las validaciones puras en `src/utils/validaciones.js`.
- `AuthScreen` mantiene la inyeccion del servicio real fuera del test unitario.

### Aislamiento de Firebase

- Firebase se aisla mediante props o `vi.mock`.
- No se importan credenciales reales en los tests.
- No se usa `.env` en tests unitarios.
- No se hacen llamadas reales a Firestore ni Authentication.

### Resultado actual

```text
Test Files: 6 passed
Tests: 30 passed
Statements: 76.82%
Branches: 68.65%
Functions: 77.96%
Lines: 77.54%
```

La configuracion de coverage mide el alcance exigido por la pauta: `src/utils/`, `LoginForm`, `TransferForm` y `TransactionHistory`. La pauta no exige cobertura del 100% del proyecto completo.

## Modelo de datos

### `users/{uid}`

Campos usados:

- `nombre`: nombre visible del usuario.
- `email`: correo autenticado.
- `emailNormalizado`: correo en minusculas para busquedas.
- `saldo`: saldo numerico en pesos completos.
- `creadoEn`: fecha de creacion con `serverTimestamp`.
- `actualizadoEn`: fecha de ultima operacion financiera.
- `ultimaTransferenciaId`: id del ultimo movimiento atomico vinculado.

### `userDirectory/{uid}`

Campos usados para buscar destinatarios por correo:

- `uid`: uid del usuario.
- `nombre`: nombre visible.
- `emailNormalizado`: correo en minusculas.

### `movimientos/{id}`

Campos usados:

- `operationId`: id de operacion asociado al documento.
- `emisorUid` y `receptorUid`: participantes.
- `emisorNombre` y `receptorNombre`: nombres para mostrar.
- `emisorEmail` y `receptorEmail`: correos cuando corresponda.
- `monto`: numero positivo.
- `descripcion`: texto opcional.
- `tipo`: `transferencia`, `deposito` o `retiro`.
- `estado`: `completado`.
- `fecha`: fecha con `serverTimestamp`.

## Funcionalidades

- Registro con Firebase Authentication y perfil en Firestore.
- Login y logout.
- Proteccion de vistas privadas mediante estado de autenticacion.
- Saldo en tiempo real con `onSnapshot`.
- Historial en tiempo real con `onSnapshot`.
- Transferencias atomicas entre usuarios.
- Depositos y retiros simulados.
- Filtros locales del historial por tipo, fecha, busqueda y orden.
- Estados de carga, error y datos vacios.
- Navegacion responsive con sidebar y menu movil.

## Programacion reactiva

La sesion se observa con `onAuthStateChanged`. El perfil, saldo e historial se sincronizan con `onSnapshot`. Cada hook limpia su suscripcion al desmontarse o al cambiar de usuario para evitar listeners duplicados y datos cruzados.

## Transacciones atomicas

Las transferencias, depositos y retiros usan `runTransaction`. Dentro de la transaccion se lee el saldo real, se valida el monto, se calcula el nuevo saldo y se crea el movimiento asociado. La UI no modifica saldo ni historial localmente; los cambios aparecen por los listeners existentes.

## Reglas Firestore

Las reglas limitan la lectura y escritura:

- Los perfiles se crean solo para el usuario autenticado.
- Los movimientos solo se leen por participantes.
- Las operaciones financieras deben actualizar saldo y crear movimiento en la misma operacion.
- `getAfter()` valida el movimiento creado y la diferencia exacta de saldo.
- Los movimientos no se pueden editar ni eliminar libremente.
- Los depositos y retiros simulados tienen limite de monto.

Estas reglas son adecuadas para un proyecto academico, no para una banca real.

## Indices

`firestore.indexes.json` incluye indices para:

- `movimientos` por `emisorUid` y `fecha` descendente.
- `movimientos` por `receptorUid` y `fecha` descendente.

Para desplegar reglas e indices, usar manualmente:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## Usuarios de prueba

La evaluacion solicita dos usuarios de prueba. Usar cuentas academicas desechables y entregar contrasenas por canal privado.

```text
## Usuarios de prueba

Entregados en privado
```

## Pruebas sugeridas

- Registro correcto y errores de formulario.
- Login correcto e incorrecto.
- Persistencia de sesion al recargar.
- Logout.
- Perfil, saldo e historial en tiempo real.
- Transferencia valida, autotransferencia, saldo insuficiente y doble submit.
- Deposito simulado valido y monto superior al limite.
- Retiro simulado valido, saldo insuficiente y concurrencia.
- Filtros de historial por tipo, fecha, busqueda, orden y limpiar filtros.
- Responsive en 1440 px, 1024 px, 768 px y 390 px.
- Navegacion por teclado, foco visible, labels y mensajes de error.

## Uso de inteligencia artificial

Se utilizo IA como apoyo para configurar Vitest, revisar refactors, generar borradores de tests, identificar casos borde y mejorar documentacion tecnica. Las propuestas fueron revisadas y adaptadas a la arquitectura del proyecto.

Se descartaron o ajustaron tests demasiado triviales porque la pauta exige verificar comportamiento relevante y no inflar cobertura. Todo codigo integrado fue probado y revisado antes de incorporarlo.

## Estructura

```text
mini-banco-react/
  firestore.indexes.json
  firestore.rules
  src/
    components/
      account/
      auth/
      dashboard/
      layout/
      ui/
    config/
    hooks/
    pages/
    services/
    styles/
    utils/
```

## Limitaciones

- Aplicacion educativa.
- Depositos y retiros simulados.
- Sin integracion bancaria.
- Sin Webpay, Mercado Pago ni tarjetas.
- Depende de Firebase.
- No esta preparada para produccion financiera real.
