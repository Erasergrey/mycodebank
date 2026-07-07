import { formatProfileDate } from '../../utils/formatters'
import Button from '../ui/Button'
import Card from '../ui/Card'
import EmptyState from '../ui/EmptyState'
import ErrorState from '../ui/ErrorState'
import LoadingSkeleton from '../ui/LoadingSkeleton'
import BalanceCard from './BalanceCard'
import FinancialSummary from './FinancialSummary'
import QuickActions from './QuickActions'
import TransactionList from './TransactionList'

function Dashboard({
  accountIdentifier,
  balance,
  createdAt,
  displayEmail,
  displayName,
  hasProfile,
  isProfileLoading,
  isRealtime,
  logoutLoading,
  onDeposit,
  onLogout,
  onRetryTransactions,
  onRetryProfile,
  onTransfer,
  onViewTransactions,
  onWithdraw,
  profileError,
  transactionCount = 0,
  transactions = [],
  transactionsError = '',
  transactionsLoading = false,
}) {
  const hasProfileError = Boolean(profileError)
  const showProfileData = !isProfileLoading && hasProfile

  return (
    <Card className="dashboard-card" aria-labelledby="dashboard-title">
      <header className="dashboard-header">
        <div>
          <p className="status-pill status-pill--success">Cuenta activa</p>
          <h1 id="dashboard-title">MYCODEBANK</h1>
        </div>
      </header>

      {hasProfileError && (
        <div className="dashboard-state dashboard-state--error">
          <ErrorState>{profileError}</ErrorState>
          <div className="dashboard-state__actions">
            <Button type="button" onClick={onRetryProfile}>
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {!isProfileLoading && !hasProfileError && !hasProfile && (
        <div className="dashboard-state">
          <EmptyState title="Perfil no encontrado">
            No encontramos la informacion de tu perfil. Puedes volver a
            intentarlo o cerrar sesion.
          </EmptyState>
          <div className="dashboard-state__actions">
            <Button type="button" onClick={onRetryProfile}>
              Reintentar
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onLogout}
              disabled={logoutLoading}
            >
              {logoutLoading ? 'Cerrando sesion...' : 'Cerrar sesion'}
            </Button>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        <Card className="dashboard-welcome">
          <p className="dashboard-kicker">Bienvenido</p>
          {isProfileLoading ? (
            <LoadingSkeleton lines={2} />
          ) : (
            <>
              <h2>{displayName}</h2>
              <p>{displayEmail}</p>
            </>
          )}
        </Card>

        <BalanceCard
          accountHolderName={showProfileData ? displayName : 'Usuario'}
          accountIdentifier={accountIdentifier}
          balance={showProfileData ? balance : null}
          accountExists={hasProfile}
          errorMessage={profileError}
          isLoading={isProfileLoading}
          isRealtime={isRealtime && showProfileData && !hasProfileError}
        />

        {showProfileData && (
          <Card className="profile-summary" aria-labelledby="profile-title">
            <div className="dashboard-section-heading">
              <p className="dashboard-kicker">Perfil</p>
              <h2 id="profile-title">Resumen del perfil</h2>
            </div>
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
                <dt>Cuenta</dt>
                <dd>{accountIdentifier}</dd>
              </div>
              <div>
                <dt>Creacion</dt>
                <dd>{formatProfileDate(createdAt)}</dd>
              </div>
            </dl>
          </Card>
        )}

        {showProfileData && (
          <QuickActions
            onDeposit={onDeposit}
            onTransfer={onTransfer}
            onViewTransactions={onViewTransactions}
            onWithdraw={onWithdraw}
          />
        )}

        <FinancialSummary
          isLoading={isProfileLoading || transactionsLoading}
          transactionCount={transactionCount}
        />

        <TransactionList
          error={transactionsError}
          isLoading={transactionsLoading}
          onRetry={onRetryTransactions}
          onTransfer={onTransfer}
          onViewTransactions={onViewTransactions}
          transactions={transactions}
        />

        <p className="dashboard-next-step">
          XBank es un proyecto academico. Las operaciones disponibles son
          simuladas y se sincronizan con Firebase.
        </p>
      </div>
    </Card>
  )
}

export default Dashboard
