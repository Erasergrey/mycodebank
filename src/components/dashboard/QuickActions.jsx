import LayoutIcon from '../layout/LayoutIcon'
import Card from '../ui/Card'

function QuickActions({
  onDeposit,
  onTransfer,
  onViewTransactions,
  onWithdraw,
}) {
  const actions = [
    {
      label: 'Transferir',
      description: 'Enviar dinero',
      icon: 'transfer',
      onClick: onTransfer,
    },
    {
      label: 'Depositar',
      description: 'Agregar fondos',
      icon: 'deposit',
      onClick: onDeposit,
    },
    {
      label: 'Retirar',
      description: 'Solicitar retiro',
      icon: 'withdraw',
      onClick: onWithdraw,
    },
    {
      label: 'Movimientos',
      description: 'Ver historial',
      icon: 'transactions',
      onClick: onViewTransactions,
    },
  ]

  return (
    <Card className="quick-actions" aria-labelledby="quick-actions-title">
      <div className="dashboard-section-heading">
        <p className="dashboard-kicker">Acciones rapidas</p>
        <h2 id="quick-actions-title">Operaciones</h2>
      </div>

      <div className="quick-actions__grid">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className="quick-action"
            onClick={action.onClick}
          >
            <span className="quick-action__icon">
              <LayoutIcon name={action.icon} />
            </span>
            <span>
              <strong>{action.label}</strong>
              <small>{action.description}</small>
            </span>
          </button>
        ))}
      </div>
    </Card>
  )
}

export default QuickActions
