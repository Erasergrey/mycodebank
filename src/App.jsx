import { useEffect, useState } from 'react'
import LoginForm from './components/auth/LoginForm'
import RegisterForm from './components/auth/RegisterForm'
import SessionPanel from './components/auth/SessionPanel'
import { subscribeToAuthState } from './services/authService'
import { getFirebaseErrorMessage } from './services/firebaseErrors'
import './styles/auth.css'

const AUTH_MODES = {
  LOGIN: 'login',
  REGISTER: 'register',
}

function App() {
  const [authMode, setAuthMode] = useState(AUTH_MODES.LOGIN)
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [authOperationInProgress, setAuthOperationInProgress] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(
      (user) => {
        setCurrentUser(user)
        setAuthError('')
        setAuthLoading(false)
      },
      (error) => {
        setAuthError(getFirebaseErrorMessage(error))
        setAuthLoading(false)
      },
    )

    return unsubscribe
  }, [])

  function handleShowLogin() {
    setAuthMode(AUTH_MODES.LOGIN)
  }

  function handleShowRegister() {
    setAuthMode(AUTH_MODES.REGISTER)
  }

  function handleAuthOperationStart() {
    setAuthError('')
    setAuthOperationInProgress(true)
  }

  function handleAuthOperationEnd() {
    setAuthOperationInProgress(false)
  }

  if (authLoading) {
    return (
      <main className="auth-shell">
        <section className="loading-panel" aria-live="polite">
          <p>Comprobando sesion...</p>
        </section>
      </main>
    )
  }

  if (currentUser && !authOperationInProgress) {
    return (
      <main className="auth-shell">
        <SessionPanel user={currentUser} />
      </main>
    )
  }

  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="auth-title">
        <header className="auth-header">
          <p className="eyebrow">React + Firebase</p>
          <h1 id="auth-title">MYCODEBANK</h1>
          <p>Acceso inicial para probar registro e inicio de sesion.</p>
        </header>

        <div className="mode-switch" aria-label="Cambiar modo de acceso">
          <button
            type="button"
            className={authMode === AUTH_MODES.LOGIN ? 'is-active' : ''}
            onClick={handleShowLogin}
            aria-pressed={authMode === AUTH_MODES.LOGIN}
          >
            Iniciar sesion
          </button>
          <button
            type="button"
            className={authMode === AUTH_MODES.REGISTER ? 'is-active' : ''}
            onClick={handleShowRegister}
            aria-pressed={authMode === AUTH_MODES.REGISTER}
          >
            Crear cuenta
          </button>
        </div>

        {authError && (
          <p className="feedback-message feedback-message--error" role="alert">
            {authError}
          </p>
        )}

        {authMode === AUTH_MODES.LOGIN ? (
          <LoginForm
            onOperationStart={handleAuthOperationStart}
            onOperationEnd={handleAuthOperationEnd}
          />
        ) : (
          <RegisterForm
            onOperationStart={handleAuthOperationStart}
            onOperationEnd={handleAuthOperationEnd}
          />
        )}
      </section>
    </main>
  )
}

export default App
