import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from './firebaseAuth'

function ensureAuthReady() {
  if (!auth) {
    throw { code: 'app/firebase-not-configured' }
  }
}

export async function registerUser({ nombre, email, password }) {
  ensureAuthReady()

  const nombreLimpio = nombre.trim()
  const emailNormalizado = email.trim().toLowerCase()

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    emailNormalizado,
    password,
  )

  try {
    const { createUserProfile } = await import('./userService')

    await createUserProfile({
      uid: userCredential.user.uid,
      nombre: nombreLimpio,
      email: userCredential.user.email ?? emailNormalizado,
    })
  } catch (profileError) {
    // Authentication y Firestore no forman una transaccion unica.
    console.error('La cuenta Auth fue creada, pero fallo el perfil Firestore.', {
      code: profileError?.code,
    })

    try {
      await deleteUser(userCredential.user)
    } catch (rollbackError) {
      console.error('No se pudo revertir la cuenta Auth incompleta.', {
        originalCode: profileError?.code,
        rollbackCode: rollbackError?.code,
      })

      try {
        await signOut(auth)
      } catch (signOutError) {
        console.error('No se pudo cerrar la sesion tras rollback fallido.', {
          originalCode: profileError?.code,
          signOutCode: signOutError?.code,
        })
      }
    }

    throw {
      code: 'app/profile-creation-failed',
      originalCode: profileError?.code,
    }
  }

  return userCredential.user
}

export async function loginUser({ email, password }) {
  ensureAuthReady()

  const emailNormalizado = email.trim().toLowerCase()
  const userCredential = await signInWithEmailAndPassword(
    auth,
    emailNormalizado,
    password,
  )

  return userCredential.user
}

export function logoutUser() {
  ensureAuthReady()

  return signOut(auth)
}

export function subscribeToAuthState(handleUser, handleError) {
  if (!auth) {
    handleError({ code: 'app/firebase-not-configured' })
    return () => {}
  }

  return onAuthStateChanged(auth, handleUser, handleError)
}
