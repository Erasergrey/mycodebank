import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const requiredFirebaseValues = Object.values(firebaseConfig)
const hasFirebaseConfig = requiredFirebaseValues.every(Boolean)

let app = null

if (hasFirebaseConfig) {
  try {
    app = initializeApp(firebaseConfig)
  } catch (error) {
    console.error('Firebase no pudo inicializarse.', {
      code: error?.code,
    })
  }
}

export { app }
export const isFirebaseConfigured = Boolean(app)
