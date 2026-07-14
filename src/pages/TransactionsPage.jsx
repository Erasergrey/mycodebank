import { useMemo, useState } from 'react'
import TransactionHistory from '../components/transactions/TransactionHistory'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const TYPE_FILTERS = [
  { label: 'Todos', value: 'all' },
  { label: 'Enviados', value: 'sent' },
  { label: 'Recibidos', value: 'received' },
  { label: 'Depositos', value: 'deposit' },
  { label: 'Retiros', value: 'withdrawal' },
]

const DATE_FILTERS = [
  { label: 'Todos', value: 'all' },
  { label: 'Hoy', value: 'today' },
  { label: 'Ultimos 7 dias', value: 'last-7-days' },
  { label: 'Ultimos 30 dias', value: 'last-30-days' },
  { label: 'Este mes', value: 'this-month' },
]

const SORT_OPTIONS = [
  { label: 'Mas recientes', value: 'newest' },
  { label: 'Mas antiguos', value: 'oldest' },
  { label: 'Mayor monto', value: 'highest-amount' },
  { label: 'Menor monto', value: 'lowest-amount' },
]

function normalizeSearchTerm(value) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function normalizeSearchField(value) {
  return typeof value === 'string' ? value.toLowerCase() : ''
}

function getStartOfToday() {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  return startOfToday
}

function isInSelectedDateRange(date, dateFilter) {
  if (dateFilter === 'all') {
    return true
  }

  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return false
  }

  const startOfToday = getStartOfToday()

  if (dateFilter === 'today') {
    return date >= startOfToday
  }

  if (dateFilter === 'last-7-days') {
    const startDate = new Date(startOfToday)
    startDate.setDate(startDate.getDate() - 6)

    return date >= startDate
  }

  if (dateFilter === 'last-30-days') {
    const startDate = new Date(startOfToday)
    startDate.setDate(startDate.getDate() - 29)

    return date >= startDate
  }

  if (dateFilter === 'this-month') {
    const startOfMonth = new Date(
      startOfToday.getFullYear(),
      startOfToday.getMonth(),
      1,
    )

    return date >= startOfMonth
  }

  return true
}

function matchesSearch(transaction, searchTerm) {
  if (!searchTerm) {
    return true
  }

  return [
    transaction.counterpartyName,
    transaction.counterpartyEmail,
    transaction.counterpartyIdentifier,
    transaction.description,
    transaction.operationId,
    transaction.id,
  ]
    .map(normalizeSearchField)
    .some((value) => value.includes(searchTerm))
}

function compareTransactionDates(firstTransaction, secondTransaction) {
  const firstTime = firstTransaction.date?.getTime()
  const secondTime = secondTransaction.date?.getTime()
  const safeFirstTime = Number.isFinite(firstTime)
    ? firstTime
    : Number.NEGATIVE_INFINITY
  const safeSecondTime = Number.isFinite(secondTime)
    ? secondTime
    : Number.NEGATIVE_INFINITY

  return safeSecondTime - safeFirstTime
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

function getResultCountLabel(count) {
  return count === 1
    ? '1 movimiento encontrado'
    : `${count} movimientos encontrados`
}

function TransactionsPage({
  currentUserEmail = '',
  currentUserId = '',
  onRetryTransactions,
  onTransfer,
  transactions = [],
  transactionsError = '',
  transactionsLoading = false,
}) {
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')
  const [searchTerm, setSearchTerm] = useState('')

  const normalizedSearchTerm = normalizeSearchTerm(searchTerm)
  const hasActiveFilters =
    typeFilter !== 'all' ||
    dateFilter !== 'all' ||
    sortOrder !== 'newest' ||
    normalizedSearchTerm.length > 0

  const visibleTransactions = useMemo(() => {
    const filteredTransactions = transactions.filter((transaction) => {
      const matchesType =
        typeFilter === 'all' || transaction.direction === typeFilter
      const matchesDate = isInSelectedDateRange(transaction.date, dateFilter)

      return (
        matchesType &&
        matchesDate &&
        matchesSearch(transaction, normalizedSearchTerm)
      )
    })

    return sortTransactions(filteredTransactions, sortOrder)
  }, [dateFilter, normalizedSearchTerm, sortOrder, transactions, typeFilter])

  const countLabel = transactionsLoading
    ? 'Conectando...'
    : getResultCountLabel(visibleTransactions.length)
  const accountCountLabel =
    transactions.length === 1
      ? '1 movimiento sincronizado'
      : `${transactions.length} movimientos sincronizados`
  const emptyTitle = transactions.length === 0
    ? 'Aun no tienes movimientos'
    : 'Sin resultados'
  const emptyDescription = transactions.length === 0
    ? 'Tus movimientos de transferencias, depositos y retiros apareceran aqui.'
    : 'No encontramos movimientos que coincidan con tus filtros.'

  function handleClearFilters() {
    setTypeFilter('all')
    setDateFilter('all')
    setSortOrder('newest')
    setSearchTerm('')
  }

  return (
    <div className="transactions-page">
      <Card
        className="transactions-page__header"
        aria-labelledby="transactions-page-title"
      >
        <p className="status-pill status-pill--success">Historial en vivo</p>
        <h2 id="transactions-page-title">Movimientos</h2>
        <p>{transactionsLoading ? 'Conectando...' : accountCountLabel}</p>
      </Card>

      <Card
        className="transactions-filters"
        aria-labelledby="transactions-filters-title"
      >
        <div className="transaction-list__header">
          <div className="dashboard-section-heading">
            <p className="dashboard-kicker">Filtros locales</p>
            <h2 id="transactions-filters-title">Buscar movimientos</h2>
          </div>
          <p className="transaction-list__count">{countLabel}</p>
        </div>

        <div className="transactions-filters__grid">
          <div className="field-group transactions-filters__search">
            <label htmlFor="transactions-search">Busqueda</label>
            <input
              id="transactions-search"
              className="ui-input"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              autoComplete="off"
              placeholder="Nombre, correo, descripcion u operacion"
            />
          </div>

          <div className="field-group">
            <label htmlFor="transactions-type-filter">Tipo</label>
            <select
              id="transactions-type-filter"
              className="ui-input"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              {TYPE_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="transactions-date-filter">Fecha</label>
            <select
              id="transactions-date-filter"
              className="ui-input"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            >
              {DATE_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="transactions-sort-order">Orden</label>
            <select
              id="transactions-sort-order"
              className="ui-input"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="transactions-filters__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
          >
            Limpiar filtros
          </Button>
        </div>
      </Card>

      <TransactionHistory
        countLabel={countLabel}
        currentUserEmail={currentUserEmail}
        currentUserId={currentUserId}
        emptyAction={
          transactions.length > 0 && hasActiveFilters ? (
            <Button
              type="button"
              variant="secondary"
              onClick={handleClearFilters}
            >
              Limpiar filtros
            </Button>
          ) : null
        }
        emptyDescription={emptyDescription}
        emptyTitle={emptyTitle}
        error={transactionsError}
        isLoading={transactionsLoading}
        kicker="Cuenta XBank"
        onRetry={onRetryTransactions}
        onTransfer={transactions.length === 0 ? onTransfer : undefined}
        sortOrder={sortOrder}
        title="Historial completo"
        transactions={visibleTransactions}
      />
    </div>
  )
}

export default TransactionsPage
