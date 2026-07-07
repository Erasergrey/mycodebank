import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'

function ensureFirestoreReady() {
  if (!db) {
    throw { code: 'app/firebase-not-configured' }
  }
}

export async function createUserProfile({ uid, nombre, email }) {
  ensureFirestoreReady()

  const nombreLimpio = nombre.trim()
  const emailDelUsuario = email.trim().toLowerCase()

  await setDoc(doc(db, 'users', uid), {
    nombre: nombreLimpio,
    email: emailDelUsuario,
    emailNormalizado: emailDelUsuario.toLowerCase(),
    saldo: 100000,
    creadoEn: serverTimestamp(),
  })
}
