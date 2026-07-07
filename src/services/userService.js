import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
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

function mapUserProfile(snapshot) {
  const data = snapshot.data()

  return {
    id: snapshot.id,
    uid: snapshot.id,
    nombre: data.nombre,
    email: data.email,
    emailNormalizado: data.emailNormalizado,
    saldo: data.saldo,
    creadoEn: data.creadoEn,
  }
}

export async function getUserProfile(uid) {
  ensureFirestoreReady()

  if (!uid) {
    throw { code: 'app/missing-user-id' }
  }

  const userRef = doc(db, 'users', uid)
  const snapshot = await getDoc(userRef)

  if (!snapshot.exists()) {
    return null
  }

  return mapUserProfile(snapshot)
}
