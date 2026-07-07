import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
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
  const rawBalance = data.saldo

  if (typeof rawBalance !== 'number' || !Number.isFinite(rawBalance)) {
    throw { code: 'app/invalid-balance' }
  }

  return {
    id: snapshot.id,
    uid: snapshot.id,
    nombre: data.nombre,
    email: data.email,
    emailNormalizado: data.emailNormalizado,
    saldo: rawBalance,
    creadoEn: data.creadoEn,
  }
}

export function subscribeToUserProfile(uid, onData, onError) {
  ensureFirestoreReady()

  if (!uid) {
    throw { code: 'app/missing-user-id' }
  }

  const userRef = doc(db, 'users', uid)

  return onSnapshot(
    userRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onData({
          profile: null,
          profileExists: false,
          fromCache: snapshot.metadata.fromCache,
        })
        return
      }

      try {
        onData({
          profile: mapUserProfile(snapshot),
          profileExists: true,
          fromCache: snapshot.metadata.fromCache,
        })
      } catch (error) {
        onError(error)
      }
    },
    onError,
  )
}
