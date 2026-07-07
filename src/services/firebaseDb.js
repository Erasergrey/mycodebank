import { getFirestore } from 'firebase/firestore'
import { app } from './firebase'

const db = app ? getFirestore(app) : null

export { db }
