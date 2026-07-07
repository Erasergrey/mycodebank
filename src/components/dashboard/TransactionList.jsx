import Button from '../ui/Button'
import Card from '../ui/Card'
import EmptyState from '../ui/EmptyState'
import ErrorState from '../ui/ErrorState'
import LoadingSkeleton from '../ui/LoadingSkeleton'
import TransactionItem from './TransactionItem'

function TransactionList({
  emptyAction = null,
  countLabel,
  emptyDescription = 'Tus movimientos apareceran aqui.',
  emptyTitle = 'Aun no tienes movimientos',
  error = '',
  isLoading = false,
  kicker = 'Movimientos recientes',
  onRetry,
  onTransfer,
  onViewTransactions,
  title = 'Historial',
  transactions = [],
}) {
  const hasError = Boolean(error)
  const hasTransactions = transactions.length > 0

  return (
    <Card className="transaction-list" aria-labelledby="transactions-title">
      <div className="transaction-list__header">
        <div className="dashboard-section-heading">
          <p className="dashboard-kicker">{kicker}</p>
          <h2 id="transactions-title">{title}</h2>
        </div>
        {countLabel && <p className="transaction-list__count">{countLabel}</p>}
      </div>

      {isLoading && (
        <div aria-live="polite">
          <LoadingSkeleton lines={4} />
          <p className="transaction-list__loading">Cargando movimientos...</p>
        </div>
      )}

      {!isLoading && hasError && (
        <div className="transaction-list__state">
          <ErrorState>
            No pudimos cargar tus movimientos. Revisa tu conexion e intenta
            nuevamente.
          </ErrorState>
          {onRetry && (
            <Button type="button" variant="secondary" onClick={onRetry}>
              Reintentar
            </Button>
          )}
        </div>
      )}

      {!isLoading && !hasError && !hasTransactions && (
        <div className="transaction-list__state">
          <EmptyState title={emptyTitle}>{emptyDescription}</EmptyState>
          {emptyAction}
          {onTransfer && (
            <Button type="button" variant="secondary" onClick={onTransfer}>
              Realizar primera transferencia
            </Button>
          )}
        </div>
      )}

      {!isLoading && !hasError && hasTransactions && (
        <>
          <ul className="transaction-list__items" aria-label={title}>
            {transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
              />
            ))}
          </ul>

          {onViewTransactions && (
            <div className="transaction-list__footer">
              <Button
                type="button"
                variant="secondary"
                onClick={onViewTransactions}
              >
                Ver todos los movimientos
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  )
}

export default TransactionList
