import LoginForm from '../auth/LoginForm'
import RegisterForm from '../auth/RegisterForm'
import { AUTH_MODES } from '../../config/auth'
import { loginUser } from '../../services/authService'
import { getFirebaseErrorMessage } from '../../services/firebaseErrors'

function AuthScreen({
  authError,
  authMode,
  onOperationEnd,
  onOperationStart,
  onShowLogin,
  onShowRegister,
}) {
  return (
    <main className="auth-shell">
      <section className="ui-card auth-card" aria-labelledby="auth-title">
        <header className="auth-header">
          <p className="eyebrow">React + Firebase</p>
          <h1 id="auth-title">MYCODEBANK</h1>
          <p>Acceso inicial para probar registro e inicio de sesion.</p>
        </header>

        <div className="mode-switch" aria-label="Cambiar modo de acceso">
          <button
            type="button"
            className={authMode === AUTH_MODES.LOGIN ? 'is-active' : ''}
            onClick={onShowLogin}
            aria-pressed={authMode === AUTH_MODES.LOGIN}
          >
            Iniciar sesion
          </button>
          <button
            type="button"
            className={authMode === AUTH_MODES.REGISTER ? 'is-active' : ''}
            onClick={onShowRegister}
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
            getErrorMessage={getFirebaseErrorMessage}
            onLogin={loginUser}
            onOperationStart={onOperationStart}
            onOperationEnd={onOperationEnd}
          />
        ) : (
          <RegisterForm
            onOperationStart={onOperationStart}
            onOperationEnd={onOperationEnd}
          />
        )}
      </section>
    </main>
  )
}

export default AuthScreen
