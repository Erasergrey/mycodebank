import { useEffect, useState } from 'react'
import { getFirebaseErrorMessage } from '../../services/firebaseErrors'
import { subscribeToUserProfile } from '../../services/userService'
import BalanceCard from './BalanceCard'

function Dashboard({ currentUser, logoutError, logoutLoading, onLogout }) {
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    if (!currentUser?.uid) {
      setProfile(null)
      setProfileLoading(false)
      setProfileError('No fue posible identificar al usuario autenticado.')
      return undefined
    }

    setProfileLoading(true)
    setProfileError('')

    try {
      const unsubscribe = subscribeToUserProfile(
        currentUser.uid,
        (profileData) => {
          setProfile(profileData)
          setProfileLoading(false)
        },
        (error) => {
          setProfileError(getFirebaseErrorMessage(error))
          setProfileLoading(false)
        },
      )

      return unsubscribe
    } catch (error) {
      setProfileError(getFirebaseErrorMessage(error))
      setProfileLoading(false)
      return undefined
    }
  }, [currentUser?.uid])

  const displayEmail = profile?.email ?? currentUser?.email ?? 'No disponible'

  return (
    <section className="dashboard-card" aria-labelledby="dashboard-title">
      <header className="dashboard-header">
        <div>
          <p className="status-pill status-pill--success">Cuenta activa</p>
          <h1 id="dashboard-title">MYCODEBANK</h1>
        </div>
        <button
          className="dashboard-logout-button"
          type="button"
          onClick={onLogout}
          disabled={logoutLoading}
        >
          {logoutLoading ? 'Cerrando sesion...' : 'Cerrar sesion'}
        </button>
      </header>

      {logoutError && (
        <p className="feedback-message feedback-message--error" role="alert">
          {logoutError}
        </p>
      )}

      {profileLoading && (
        <div className="dashboard-state" aria-live="polite">
          <p>Cargando informacion de tu cuenta...</p>
        </div>
      )}

      {!profileLoading && profileError && (
        <div className="dashboard-state dashboard-state--error">
          <p className="feedback-message feedback-message--error" role="alert">
            {profileError}
          </p>
        </div>
      )}

      {!profileLoading && !profileError && !profile && (
        <div className="dashboard-state">
          <p>No encontramos el perfil bancario asociado a esta cuenta.</p>
        </div>
      )}

      {!profileLoading && !profileError && profile && (
        <div className="dashboard-content">
          <section className="dashboard-welcome">
            <p className="dashboard-kicker">Bienvenido</p>
            <h2>{profile.nombre}</h2>
            <p>{displayEmail}</p>
          </section>

          <BalanceCard saldo={profile.saldo} />

          <section className="profile-summary" aria-labelledby="profile-title">
            <h2 id="profile-title">Resumen del perfil</h2>
            <dl>
              <div>
                <dt>Estado</dt>
                <dd>Activa</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{displayEmail}</dd>
              </div>
              <div>
                <dt>Documento</dt>
                <dd>{profile.id}</dd>
              </div>
            </dl>
          </section>

          <p className="dashboard-next-step">
            Transferencias e historial se agregaran en la siguiente etapa.
          </p>
        </div>
      )}
    </section>
  )
}

export default Dashboard
