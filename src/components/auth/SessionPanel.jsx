import { useState } from 'react'
import { logoutUser } from '../../services/authService'
import { getFirebaseErrorMessage } from '../../services/firebaseErrors'

function SessionPanel({ user }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleLogoutClick() {
    setErrorMessage('')
    setIsSigningOut(true)

    try {
      await logoutUser()
    } catch (error) {
      setErrorMessage(getFirebaseErrorMessage(error))
      setIsSigningOut(false)
    }
  }

  return (
    <section className="session-panel" aria-labelledby="session-title">
      <p className="status-pill status-pill--success">Sesion iniciada</p>
      <h1 id="session-title">MYCODEBANK</h1>
      <dl className="session-details">
        <div>
          <dt>Email</dt>
          <dd>{user.email}</dd>
        </div>
        <div>
          <dt>UID tecnico</dt>
          <dd>{user.uid}</dd>
        </div>
      </dl>
      <p className="next-stage-message">
        El dashboard se implementara en la siguiente etapa.
      </p>

      {errorMessage && (
        <p className="feedback-message feedback-message--error" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        className="secondary-button"
        type="button"
        onClick={handleLogoutClick}
        disabled={isSigningOut}
      >
        {isSigningOut ? 'Cerrando sesion...' : 'Cerrar sesion'}
      </button>
    </section>
  )
}

export default SessionPanel
