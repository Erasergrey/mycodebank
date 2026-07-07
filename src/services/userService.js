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

export function subscribeToUserProfile(uid, onData, onError) {
  ensureFirestoreReady()

  if (!uid) {
    onError({ code: 'app/missing-user-id' })
    return () => {}
  }

  const userRef = doc(db, 'users', uid)

  return onSnapshot(
    userRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null)
        return
      }

      const data = snapshot.data()

      onData({
        id: snapshot.id,
        nombre: data.nombre,
        email: data.email,
        emailNormalizado: data.emailNormalizado,
        saldo: data.saldo,
        creadoEn: data.creadoEn,
      })
    },
    onError,
  )
}
