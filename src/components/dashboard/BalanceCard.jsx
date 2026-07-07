import { useState } from 'react'
import { formatCurrency } from '../../utils/formatters'
import Card from '../ui/Card'
import LoadingSkeleton from '../ui/LoadingSkeleton'

function BalanceCard({
  accountExists = false,
  accountHolderName,
  accountIdentifier,
  balance,
  errorMessage = '',
  isLoading = false,
  isRealtime = false,
}) {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const hasError = Boolean(errorMessage)
  const hasValidBalance = typeof balance === 'number' && Number.isFinite(balance)
  const balanceLabel =
    hasValidBalance && isBalanceVisible
      ? formatCurrency(balance)
      : 'Saldo no disponible'
  const hiddenBalanceLabel = hasValidBalance ? '******' : balanceLabel

  function handleToggleBalanceVisibility() {
    setIsBalanceVisible((isVisible) => !isVisible)
  }

  function getStatusMessage() {
    if (isLoading) {
      return 'Conectando con Firestore...'
    }

    if (hasError) {
      return errorMessage
    }

    if (!accountExists) {
      return 'No encontramos la cuenta asociada a este usuario.'
    }

    if (isRealtime && hasValidBalance) {
      return 'Actualizado en tiempo real'
    }

    return 'Saldo no disponible'
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
            disabled={!hasValidBalance || hasError || !accountExists}
            aria-label={isBalanceVisible ? 'Ocultar saldo' : 'Mostrar saldo'}
          >
            {isBalanceVisible ? 'Ocultar saldo' : 'Mostrar saldo'}
          </button>
        </>
      )}

      <p
        className={
          isRealtime && !hasError
            ? 'balance-card__status balance-card__status--live'
            : 'balance-card__status'
        }
      >
        {getStatusMessage()}
      </p>
    </Card>
  )
}

export default BalanceCard
