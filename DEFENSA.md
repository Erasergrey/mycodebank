# Guia de defensa XBank

## 1. Por que se usa `onSnapshot`

`onSnapshot` mantiene sincronizados perfil, saldo e historial sin recargar la pagina. Cuando Firestore cambia, la UI recibe el nuevo estado automaticamente.

## 2. Que ocurre si no se llama a `unsubscribe`

Quedan listeners activos aunque el componente ya no los use. Eso puede duplicar lecturas, mostrar datos de otro usuario o provocar fugas de memoria.

## 3. Por que el saldo no se guarda solo en estado local

El estado local se puede perder al recargar y no es fuente confiable. El saldo real del proyecto vive en Firestore y la interfaz solo lo muestra.

## 4. Por que se usa `runTransaction`

`runTransaction` permite leer saldo actualizado, validar monto y escribir saldo + movimiento como una sola operacion atomica. Evita cambios parciales.

## 5. Que evita el doble submit

Los formularios usan estado de envio, botones deshabilitados y validaciones logicas como `if (isSubmitting) return`. Asi se evita crear dos operaciones por doble clic.

## 6. Como se diferencia movimiento enviado y recibido

El historial compara el `uid` del usuario autenticado con `emisorUid` y `receptorUid`. Para depositos y retiros tambien se usa `tipo`.

## 7. Como se protegen las rutas

`App.jsx` observa la sesion con Firebase Auth. Si no hay usuario, redirige a login. Si hay usuario, permite navegar por las vistas privadas.

## 8. Que hace `event.preventDefault()`

Evita que el navegador recargue la pagina al enviar un formulario. React mantiene el control del flujo y muestra errores o confirmaciones.

## 9. Por que no se expone `.env`

`.env` contiene configuracion real del proyecto Firebase y no debe versionarse. El repositorio incluye solo `.env.example` sin valores.

## 10. Como funcionan las reglas

Las reglas validan autenticacion, campos permitidos, participantes, montos, saldos y movimientos. Para operaciones financieras usan `getAfter()` para comprobar que el cambio de saldo coincide con el movimiento creado en la misma operacion.
