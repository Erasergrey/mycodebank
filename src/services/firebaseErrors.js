const DEFAULT_ERROR_MESSAGE =
  'No fue posible completar la operacion. Intentalo nuevamente.'

const ERROR_MESSAGES = {
  'auth/email-already-in-use': 'Ya existe una cuenta registrada con este correo.',
  'auth/invalid-email': 'El correo ingresado no es valido.',
  'auth/weak-password': 'La contrasena debe tener al menos 6 caracteres.',
  'auth/invalid-credential': 'El correo o la contrasena no son correctos.',
  'auth/invalid-login-credentials':
    'El correo o la contrasena no son correctos.',
  'auth/user-not-found': 'El correo o la contrasena no son correctos.',
  'auth/wrong-password': 'El correo o la contrasena no son correctos.',
  'auth/user-disabled': 'Esta cuenta se encuentra deshabilitada.',
  'auth/too-many-requests':
    'Se detectaron demasiados intentos. Espera unos minutos e intentalo nuevamente.',
  'auth/network-request-failed':
    'No se pudo conectar con Firebase. Revisa tu conexion a internet.',
  'permission-denied':
    'No tienes permisos para consultar esta cuenta.',
  unauthenticated: 'Tu sesion expiro. Inicia sesion nuevamente.',
  unavailable: 'El servicio no esta disponible temporalmente.',
  'deadline-exceeded': 'La consulta tardo demasiado. Intenta nuevamente.',
  cancelled: 'No pudimos completar la consulta. Intenta nuevamente.',
  unknown: 'No pudimos cargar tu saldo.',
  'not-found': 'No encontramos la informacion de tu cuenta.',
  'app/firebase-not-configured':
    'Firebase no esta configurado. Revisa las variables reales en .env y reinicia Vite.',
  'app/missing-user-id':
    'No fue posible identificar al usuario autenticado. Cierra sesion e ingresa nuevamente.',
  'app/invalid-balance':
    'No pudimos interpretar el saldo de tu cuenta.',
  'app/profile-creation-failed':
    'La cuenta fue creada en Authentication, pero no se pudo preparar el perfil bancario. Cierra sesion e intenta ingresar nuevamente.',
}

export function getFirebaseErrorMessage(error) {
  return ERROR_MESSAGES[error?.code] ?? DEFAULT_ERROR_MESSAGE
}
