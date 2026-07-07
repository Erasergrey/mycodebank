import Card from '../ui/Card'

const currencyFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

function BalanceCard({ saldo }) {
  const hasValidBalance = typeof saldo === 'number' && Number.isFinite(saldo)

  return (
    <Card className="balance-card" aria-labelledby="balance-title">
      <p className="dashboard-kicker">Saldo disponible</p>
      <h2 id="balance-title">
        {hasValidBalance ? currencyFormatter.format(saldo) : 'Saldo no disponible'}
      </h2>
      <p className="balance-card__status">Actualizado en tiempo real</p>
    </Card>
  )
}

export default BalanceCard
