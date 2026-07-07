import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from './firebase'
import { createUserProfile } from './userService'

export async function registerUser({ nombre, email, password }) {
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
  const emailNormalizado = email.trim().toLowerCase()
  const userCredential = await signInWithEmailAndPassword(
    auth,
    emailNormalizado,
    password,
  )

  return userCredential.user
}

export function logoutUser() {
  return signOut(auth)
}

export function subscribeToAuthState(handleUser, handleError) {
  return onAuthStateChanged(auth, handleUser, handleError)
}
