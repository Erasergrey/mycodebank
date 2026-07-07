import TransactionList from '../components/dashboard/TransactionList'
import Card from '../components/ui/Card'

function TransactionsPage({
  onRetryTransactions,
  onTransfer,
  transactions = [],
  transactionsError = '',
  transactionsLoading = false,
}) {
  const countLabel = transactionsLoading
    ? 'Conectando...'
    : `${transactions.length} movimientos`

  return (
    <div className="transactions-page">
      <Card
        className="transactions-page__header"
        aria-labelledby="transactions-page-title"
      >
        <p className="status-pill status-pill--success">Historial en vivo</p>
        <h2 id="transactions-page-title">Movimientos</h2>
        <p>{countLabel}</p>
      </Card>

      <TransactionList
        countLabel={countLabel}
        emptyDescription="Tus transferencias enviadas y recibidas apareceran aqui."
        error={transactionsError}
        isLoading={transactionsLoading}
        kicker="Cuenta XBank"
        onRetry={onRetryTransactions}
        onTransfer={onTransfer}
        title="Historial completo"
        transactions={transactions}
      />
    </div>
  )
}

export default TransactionsPage
