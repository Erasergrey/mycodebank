import {
  createUserWithEmailAndPassword,
  deleteUser,
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
    try {
      await deleteUser(userCredential.user)
    } catch (rollbackError) {
      console.error('No se pudo revertir el registro incompleto.', {
        originalCode: error?.code,
        rollbackCode: rollbackError?.code,
      })
    }

    throw error
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
