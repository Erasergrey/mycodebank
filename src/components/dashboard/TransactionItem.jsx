import { formatCurrency, formatTransactionDate } from '../../utils/formatters'
import LayoutIcon from '../layout/LayoutIcon'

const DIRECTION_LABELS = {
  sent: 'Transferencia enviada',
  received: 'Transferencia recibida',
  deposit: 'Deposito simulado',
  withdrawal: 'Retiro simulado',
}

const STATUS_LABELS = {
  completed: 'Completado',
  pending: 'Pendiente',
  failed: 'Fallido',
}

function getAmountSign(direction) {
  return direction === 'received' || direction === 'deposit' ? '+' : '-'
}

function getIconName(direction) {
  return direction === 'received' || direction === 'deposit'
    ? 'deposit'
    : 'withdraw'
}

function getShortOperationId(value) {
  if (!value) {
    return 'No disponible'
  }

  return value.slice(0, 8).toUpperCase()
}

function TransactionItem({ transaction }) {
  const label = DIRECTION_LABELS[transaction.direction] ?? 'Movimiento'
  const sign = getAmountSign(transaction.direction)
  const amountClass =
    sign === '+'
      ? 'transaction-item__amount--positive'
      : 'transaction-item__amount--negative'
  const movementClass =
    sign === '+'
      ? 'transaction-item--positive'
      : 'transaction-item--negative'
  const formattedAmount = `${sign}${formatCurrency(transaction.amount)}`
  const amountContext = `${label} por ${formatCurrency(transaction.amount)}`
  const counterpartyDetail =
    transaction.counterpartyEmail ||
    transaction.counterpartyIdentifier ||
    'Sin identificador disponible'

  return (
    <li className={`transaction-item ${movementClass}`}>
      <span className="transaction-item__icon">
        <LayoutIcon name={getIconName(transaction.direction)} />
      </span>

      <div className="transaction-item__main">
        <div className="transaction-item__title-row">
          <h3>{label}</h3>
          {transaction.status && (
            <span className="transaction-item__status">
              {STATUS_LABELS[transaction.status] ?? transaction.status}
            </span>
          )}
        </div>
        <p className="transaction-item__counterparty">
          {transaction.counterpartyName}
        </p>
        <p className="transaction-item__detail">{counterpartyDetail}</p>
        <p className="transaction-item__description">
          {transaction.description ?? 'Sin descripcion'}
        </p>
        <p className="transaction-item__date">
          {formatTransactionDate(transaction.date)}
        </p>
        <p className="transaction-item__operation">
          Operacion: {getShortOperationId(transaction.operationId)}
        </p>
      </div>

      <p className={`transaction-item__amount ${amountClass}`}>
        <span aria-label={amountContext}>{formattedAmount}</span>
      </p>
    </li>
  )
}

export default TransactionItem
