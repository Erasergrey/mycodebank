import { getAuth } from 'firebase/auth'
import { app } from './firebase'

const auth = app ? getAuth(app) : null

export { auth }
