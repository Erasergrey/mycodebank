import Button from '../ui/Button'
import Card from '../ui/Card'

function TransactionList({ onViewTransactions }) {
  return (
    <Card className="transaction-list" aria-labelledby="transactions-title">
      <div className="dashboard-section-heading">
        <p className="dashboard-kicker">Movimientos recientes</p>
        <h2 id="transactions-title">Historial</h2>
      </div>

      <div className="transaction-list__empty">
        <p>Tus movimientos apareceran aqui cuando conectemos el historial.</p>
        <Button type="button" variant="secondary" onClick={onViewTransactions}>
          Ver movimientos
        </Button>
      </div>
    </Card>
  )
}

export default TransactionList
