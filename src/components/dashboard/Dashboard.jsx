import Card from '../ui/Card'
import EmptyState from '../ui/EmptyState'
import ErrorState from '../ui/ErrorState'
import LoadingSkeleton from '../ui/LoadingSkeleton'
import BalanceCard from './BalanceCard'

function Dashboard({ currentUser, profile, profileError, profileLoading }) {
  const displayEmail = profile?.email ?? currentUser?.email ?? 'No disponible'
  const displayName = profile?.nombre?.trim() || 'Usuario sin nombre configurado'

  return (
    <Card className="dashboard-card" aria-labelledby="dashboard-title">
      <header className="dashboard-header">
        <div>
          <p className="status-pill status-pill--success">Cuenta activa</p>
          <h1 id="dashboard-title">MYCODEBANK</h1>
        </div>
      </header>

      {profileLoading && (
        <div className="dashboard-state" aria-live="polite">
          <LoadingSkeleton lines={2} />
          <p>Cargando informacion de tu cuenta...</p>
        </div>
      )}

      {!profileLoading && profileError && (
        <div className="dashboard-state dashboard-state--error">
          <ErrorState>{profileError}</ErrorState>
        </div>
      )}

      {!profileLoading && !profileError && !profile && (
        <EmptyState title="Perfil no encontrado">
          No encontramos el perfil bancario asociado a esta cuenta.
        </EmptyState>
      )}

      {!profileLoading && !profileError && profile && (
        <div className="dashboard-content">
          <Card className="dashboard-welcome">
            <p className="dashboard-kicker">Bienvenido</p>
            <h2>{displayName}</h2>
            <p>{displayEmail}</p>
          </Card>

          <BalanceCard saldo={profile.saldo} />

          <Card className="profile-summary" aria-labelledby="profile-title">
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
          </Card>

          <p className="dashboard-next-step">
            Transferencias e historial se agregaran en la siguiente etapa.
          </p>
        </div>
      )}
    </Card>
  )
}

export default Dashboard
