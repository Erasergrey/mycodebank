import { useState } from 'react'
import { formatCurrency } from '../../utils/formatters'
import Card from '../ui/Card'
import LoadingSkeleton from '../ui/LoadingSkeleton'

function BalanceCard({
  accountHolderName,
  accountIdentifier,
  balance,
  hasError = false,
  isLoading = false,
}) {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const hasValidBalance = typeof balance === 'number' && Number.isFinite(balance)
  const balanceLabel =
    hasValidBalance && isBalanceVisible
      ? formatCurrency(balance)
      : 'Saldo no disponible'
  const hiddenBalanceLabel = hasValidBalance ? '******' : balanceLabel

  function handleToggleBalanceVisibility() {
    setIsBalanceVisible((isVisible) => !isVisible)
  }

  return (
    <Card className="balance-card" aria-labelledby="balance-title">
      <div className="balance-card__header">
        <div>
          <p className="dashboard-kicker">Saldo disponible</p>
          <p className="balance-card__owner">{accountHolderName}</p>
        </div>
        <span className="balance-card__identifier">{accountIdentifier}</span>
      </div>

      {isLoading ? (
        <div className="balance-card__loading" aria-live="polite">
          <LoadingSkeleton lines={2} />
        </div>
      ) : (
        <>
          <h2 id="balance-title">
            {isBalanceVisible ? balanceLabel : hiddenBalanceLabel}
          </h2>
          <button
            type="button"
            className="balance-card__toggle"
            onClick={handleToggleBalanceVisibility}
            disabled={!hasValidBalance || hasError}
            aria-label={isBalanceVisible ? 'Ocultar saldo' : 'Mostrar saldo'}
          >
            {isBalanceVisible ? 'Ocultar saldo' : 'Mostrar saldo'}
          </button>
        </>
      )}

      <p className="balance-card__status">
        {hasError
          ? 'No pudimos cargar el saldo del perfil.'
          : 'Lectura inicial del perfil'}
      </p>
    </Card>
  )
}

export default BalanceCard
