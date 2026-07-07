import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from './firebase'
import { createUserProfile } from './userService'

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
    await createUserProfile({
      uid: userCredential.user.uid,
      nombre: nombreLimpio,
      email: userCredential.user.email ?? emailNormalizado,
    })
  } catch (error) {
    // Authentication y Firestore no forman una transaccion unica.
    console.error('La cuenta Auth fue creada, pero fallo el perfil Firestore.', {
      code: error?.code,
    })

    try {
      await signOut(auth)
    } catch (signOutError) {
      console.error('No se pudo cerrar la sesion del registro incompleto.', {
        originalCode: error?.code,
        signOutCode: signOutError?.code,
      })
    }

    throw { code: 'app/profile-creation-failed', originalError: error }
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
