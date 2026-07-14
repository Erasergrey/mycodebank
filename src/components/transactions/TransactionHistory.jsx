import TransactionList from '../dashboard/TransactionList'

const STATUS_MAP = {
  completado: 'completed',
  pendiente: 'pending',
  fallido: 'failed',
}

function getCleanString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeEmail(value) {
  return getCleanString(value).toLowerCase()
}

function getOptionalString(value) {
  const cleanValue = getCleanString(value)

  return cleanValue || null
}

function getSafeDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value
  }

  if (value?.toDate) {
    const date = value.toDate()

    return Number.isNaN(date.getTime()) ? null : date
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)

    return Number.isNaN(date.getTime()) ? null : date
  }

  return null
}

function getMovementType(transaction) {
  return getCleanString(transaction.type || transaction.tipo)
}

function getParticipantEmail(transaction, fieldName) {
  return normalizeEmail(transaction[fieldName])
}

function getDirection(transaction, currentUserEmail, currentUserId) {
  if (transaction.direction) {
    return transaction.direction
  }

  const type = getMovementType(transaction)

  if (type === 'deposito' || type === 'deposit') {
    return 'deposit'
  }

  if (type === 'retiro' || type === 'withdrawal') {
    return 'withdrawal'
  }

  const normalizedCurrentUserEmail = normalizeEmail(currentUserEmail)
  const senderEmail = getParticipantEmail(transaction, 'emisorEmail')
  const receiverEmail = getParticipantEmail(transaction, 'receptorEmail')
  const senderUid = getCleanString(transaction.senderUid || transaction.emisorUid)
  const receiverUid = getCleanString(
    transaction.receiverUid || transaction.receptorUid,
  )

  if (
    normalizedCurrentUserEmail &&
    senderEmail === normalizedCurrentUserEmail
  ) {
    return 'sent'
  }

  if (
    normalizedCurrentUserEmail &&
    receiverEmail === normalizedCurrentUserEmail
  ) {
    return 'received'
  }

  if (currentUserId && senderUid === currentUserId) {
    return 'sent'
  }

  if (currentUserId && receiverUid === currentUserId) {
    return 'received'
  }

  return 'sent'
}

function getCounterparty(transaction, direction) {
  if (transaction.counterpartyName || transaction.counterpartyEmail) {
    return {
      name: transaction.counterpartyName || transaction.counterpartyEmail,
      email: getOptionalString(transaction.counterpartyEmail),
      identifier: getOptionalString(transaction.counterpartyIdentifier),
    }
  }

  if (direction === 'sent') {
    const email = getOptionalString(transaction.receptorEmail)

    return {
      name:
        getOptionalString(transaction.receptorNombre) ||
        email ||
        'Usuario XBank',
      email,
      identifier: getOptionalString(transaction.receptorUid),
    }
  }

  if (direction === 'received') {
    const email = getOptionalString(transaction.emisorEmail)

    return {
      name:
        getOptionalString(transaction.emisorNombre) ||
        email ||
        'Usuario XBank',
      email,
      identifier: getOptionalString(transaction.emisorUid),
    }
  }

  return {
    name: 'XBank Demo',
    email: null,
    identifier: '',
  }
}

function getTransactionStatus(transaction) {
  const status = getCleanString(transaction.status || transaction.estado)

  return STATUS_MAP[status] ?? status
}

function normalizeTransaction(transaction, currentUserEmail, currentUserId) {
  const direction = getDirection(transaction, currentUserEmail, currentUserId)
  const counterparty = getCounterparty(transaction, direction)
  const id =
    getCleanString(transaction.id) ||
    getCleanString(transaction.operationId) ||
    getCleanString(transaction.operacionId)

  return {
    id,
    operationId:
      getOptionalString(transaction.operationId) ||
      getOptionalString(transaction.operacionId) ||
      id,
    senderUid: getOptionalString(transaction.senderUid || transaction.emisorUid),
    receiverUid: getOptionalString(
      transaction.receiverUid || transaction.receptorUid,
    ),
    counterpartyName: counterparty.name,
    counterpartyEmail: counterparty.email,
    counterpartyIdentifier: counterparty.identifier,
    amount: Number(transaction.amount ?? transaction.monto),
    description:
      getOptionalString(transaction.description) ||
      getOptionalString(transaction.descripcion),
    date: getSafeDate(transaction.date ?? transaction.fecha),
    direction,
    type: getMovementType(transaction),
    status: getTransactionStatus(transaction),
  }
}

function compareTransactionDates(firstTransaction, secondTransaction) {
  const firstTime = firstTransaction.date?.getTime() ?? Number.NEGATIVE_INFINITY
  const secondTime = secondTransaction.date?.getTime() ?? Number.NEGATIVE_INFINITY

  if (firstTime !== secondTime) {
    return secondTime - firstTime
  }

  return firstTransaction.id.localeCompare(secondTransaction.id)
}

function sortTransactions(transactions, sortOrder) {
  return [...transactions].sort((firstTransaction, secondTransaction) => {
    if (sortOrder === 'oldest') {
      return compareTransactionDates(secondTransaction, firstTransaction)
    }

    if (sortOrder === 'highest-amount') {
      return secondTransaction.amount - firstTransaction.amount
    }

    if (sortOrder === 'lowest-amount') {
      return firstTransaction.amount - secondTransaction.amount
    }

    return compareTransactionDates(firstTransaction, secondTransaction)
  })
}

function TransactionHistory({
  countLabel,
  currentUserEmail = '',
  currentUserId = '',
  emptyAction = null,
  emptyDescription = 'Tus movimientos apareceran aqui.',
  emptyTitle = 'Aun no tienes movimientos',
  error = '',
  isLoading = false,
  kicker = 'Movimientos recientes',
  onRetry,
  onTransfer,
  onViewTransactions,
  sortOrder = 'newest',
  title = 'Historial',
  transactions = [],
}) {
  const normalizedTransactions = sortTransactions(
    transactions.map((transaction) =>
      normalizeTransaction(transaction, currentUserEmail, currentUserId),
    ),
    sortOrder,
  )

  return (
    <TransactionList
      countLabel={countLabel}
      emptyAction={emptyAction}
      emptyDescription={emptyDescription}
      emptyTitle={emptyTitle}
      error={error}
      isLoading={isLoading}
      kicker={kicker}
      onRetry={onRetry}
      onTransfer={onTransfer}
      onViewTransactions={onViewTransactions}
      title={title}
      transactions={normalizedTransactions}
    />
  )
}

export default TransactionHistory
