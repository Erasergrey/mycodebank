const DEFAULT_ERROR_MESSAGE =
  'No fue posible completar la operacion. Intentalo nuevamente.'

const ERROR_MESSAGES = {
  'auth/email-already-in-use': 'Ya existe una cuenta registrada con este correo.',
  'auth/invalid-email': 'Ingresa un correo valido.',
  'auth/weak-password': 'La contrasena debe tener al menos 6 caracteres.',
  'auth/invalid-credential': 'El correo o la contrasena no son correctos.',
  'auth/user-disabled': 'Esta cuenta se encuentra deshabilitada.',
  'auth/too-many-requests':
    'Se detectaron demasiados intentos. Espera unos minutos e intentalo nuevamente.',
  'auth/network-request-failed':
    'No se pudo conectar con Firebase. Revisa tu conexion a internet.',
  'permission-denied':
    'No tienes permisos para completar esta operacion en Firestore.',
}

export function getFirebaseErrorMessage(error) {
  return ERROR_MESSAGES[error?.code] ?? DEFAULT_ERROR_MESSAGE
}
