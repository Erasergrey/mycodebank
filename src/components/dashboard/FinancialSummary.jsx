import Card from '../ui/Card'
import LoadingSkeleton from '../ui/LoadingSkeleton'

function FinancialSummary({ isLoading }) {
  const items = [
    ['Ingresos del mes', '-'],
    ['Egresos del mes', '-'],
    ['Movimientos', '-'],
    ['Ultima actualizacion', '-'],
  ]

  return (
    <Card className="financial-summary" aria-labelledby="summary-title">
      <div className="dashboard-section-heading">
        <p className="dashboard-kicker">Resumen financiero</p>
        <h2 id="summary-title">Disponible proximamente</h2>
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={3} />
      ) : (
        <dl className="financial-summary__grid">
          {items.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </Card>
  )
}

export default FinancialSummary
