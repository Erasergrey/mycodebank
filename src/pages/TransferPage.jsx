import { useEffect, useState } from 'react'
import LayoutIcon from '../components/layout/LayoutIcon'
import TransferForm from '../components/transfer/TransferForm'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ErrorState from '../components/ui/ErrorState'
import {
  findRecipientByEmail,
  getTransferErrorMessage,
  transferMoney,
  TransferError,
} from '../services/transferService'
import { formatCurrency, formatTransactionDate } from '../utils/formatters'

function getShortOperationId(value) {
  if (!value) {
    return 'No disponible'
  }

  return value.slice(0, 8).toUpperCase()
}

function getVisibleBalance(profile) {
  return typeof profile?.saldo === 'number' && Number.isFinite(profile.saldo)
    ? profile.saldo
    : null
}

function TransferPage({
  currentUser,
  onGoDashboard,
  onViewTransactions,
  profile,
  profileLoading,
}) {
  const [formError, setFormError] = useState('')
  const [formFieldErrors, setFormFieldErrors] = useState({})
  const [formResetKey, setFormResetKey] = useState(0)
  const [recipient, setRecipient] = useState(null)
  const [recipientLookupEmail, setRecipientLookupEmail] = useState('')
  const [isSearchingRecipient, setIsSearchingRecipient] = useState(false)
  const [confirmation, setConfirmation] = useState(null)
  const [transferResult, setTransferResult] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const visibleBalance = getVisibleBalance(profile)
  const hasUsableBalance = visibleBalance !== null

  useEffect(() => {
    function handleEscape(event) {
      if (event.key !== 'Escape' || isSubmitting) {
        return
      }

      if (confirmation) {
        setConfirmation(null)
      }

      if (transferResult) {
        setTransferResult(null)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [confirmation, isSubmitting, transferResult])

  function clearTransferFormFeedback() {
    setFormFieldErrors({})
    setFormError('')
  }

  function handleRecipientReset() {
    setRecipient(null)
    setRecipientLookupEmail('')
    clearTransferFormFeedback()
  }

  async function resolveRecipient(normalizedRecipientEmail) {
    if (
      recipient &&
      recipientLookupEmail === normalizedRecipientEmail
    ) {
      return recipient
    }

    setIsSearchingRecipient(true)

    try {
      const foundRecipient = await findRecipientByEmail(normalizedRecipientEmail)

      if (foundRecipient.uid === currentUser?.uid) {
        throw new TransferError('SELF_TRANSFER')
      }

      setRecipient(foundRecipient)
      setRecipientLookupEmail(normalizedRecipientEmail)
      return foundRecipient
    } finally {
      setIsSearchingRecipient(false)
    }
  }

  async function handleSearchRecipient(normalizedRecipientEmail) {
    if (isSearchingRecipient) {
      return
    }

    setFormError('')
    setFormFieldErrors((currentErrors) => ({
      ...currentErrors,
      recipientEmail: '',
    }))

    try {
      await resolveRecipient(normalizedRecipientEmail)
    } catch (error) {
      setRecipient(null)
      setRecipientLookupEmail('')
      setFormFieldErrors((currentErrors) => ({
        ...currentErrors,
        recipientEmail: getTransferErrorMessage(error),
      }))
    }
  }

  async function handleTransferSubmit({ monto, emailDestino, descripcion }) {
    if (isSubmitting || isSearchingRecipient) {
      return
    }

    setFormError('')
    setTransferResult(null)
    setFormFieldErrors({})

    if (!currentUser?.uid) {
      setFormError('Inicia sesion para realizar una transferencia.')
      return
    }

    if (!hasUsableBalance && !profileLoading) {
      setFormError('No pudimos validar tu saldo disponible.')
      return
    }

    try {
      const foundRecipient = await resolveRecipient(emailDestino)

      setFormFieldErrors({})
      setConfirmation({
        amount: monto,
        description: descripcion,
        estimatedBalance: visibleBalance - monto,
        recipient: foundRecipient,
        visibleBalance,
      })
    } catch (error) {
      setRecipient(null)
      setRecipientLookupEmail('')
      setFormFieldErrors((currentErrors) => ({
        ...currentErrors,
        recipientEmail: getTransferErrorMessage(error),
      }))
    }
  }

  function handleCancelConfirmation() {
    if (isSubmitting) {
      return
    }

    setConfirmation(null)
    setFormError('')
  }

  async function handleConfirmTransfer() {
    if (isSubmitting || !confirmation) {
      return
    }

    setIsSubmitting(true)
    setFormError('')

    try {
      const result = await transferMoney({
        amount: confirmation.amount,
        description: confirmation.description,
        recipientUid: confirmation.recipient.uid,
        senderUid: currentUser?.uid,
      })

      setConfirmation(null)
      setTransferResult(result)
      setFormResetKey((currentKey) => currentKey + 1)
      setFormFieldErrors({})
      setRecipient(null)
      setRecipientLookupEmail('')
    } catch (error) {
      setFormError(getTransferErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleNewTransfer() {
    setTransferResult(null)
    setFormError('')
  }

  return (
    <div className="transfer-page">
      <Card className="transfer-panel" aria-labelledby="transfer-title">
        <div className="dashboard-section-heading">
          <p className="dashboard-kicker">Transferencia</p>
          <h2 id="transfer-title">Transferir dinero</h2>
        </div>

        <div className="transfer-balance-summary">
          <span className="transfer-balance-summary__icon">
            <LayoutIcon name="transfer" />
          </span>
          <div>
            <p>Saldo disponible</p>
            <strong>
              {hasUsableBalance ? formatCurrency(visibleBalance) : 'No disponible'}
            </strong>
          </div>
        </div>

        <TransferForm
          emailUsuarioActual={currentUser?.email ?? ''}
          externalError={formError}
          externalFieldErrors={formFieldErrors}
          isBalanceLoading={profileLoading}
          isSearchingRecipient={isSearchingRecipient}
          isSubmitting={isSubmitting}
          onClearExternalErrors={clearTransferFormFeedback}
          onRecipientReset={handleRecipientReset}
          onSearchRecipient={handleSearchRecipient}
          onTransfer={handleTransferSubmit}
          recipient={recipient}
          resetKey={formResetKey}
          saldoDisponible={visibleBalance}
        />
      </Card>

      {confirmation && (
        <div className="transfer-modal" role="presentation">
          <button
            type="button"
            className="transfer-modal__backdrop"
            onClick={handleCancelConfirmation}
            disabled={isSubmitting}
            aria-label="Cerrar confirmacion"
          />
          <Card
            className="transfer-modal__panel"
            aria-labelledby="transfer-confirm-title"
            role="dialog"
            aria-modal="true"
          >
            <p className="dashboard-kicker">Confirmacion</p>
            <h2 id="transfer-confirm-title">Revisa la transferencia</h2>
            <dl className="transfer-confirmation-list">
              <div>
                <dt>Destinatario</dt>
                <dd>{confirmation.recipient.name}</dd>
              </div>
              <div>
                <dt>Correo</dt>
                <dd>{confirmation.recipient.email}</dd>
              </div>
              <div>
                <dt>Monto</dt>
                <dd>{formatCurrency(confirmation.amount)}</dd>
              </div>
              <div>
                <dt>Saldo actual</dt>
                <dd>{formatCurrency(confirmation.visibleBalance)}</dd>
              </div>
              <div>
                <dt>Saldo estimado</dt>
                <dd>{formatCurrency(confirmation.estimatedBalance)}</dd>
              </div>
              <div>
                <dt>Descripcion</dt>
                <dd>{confirmation.description || 'Sin descripcion'}</dd>
              </div>
            </dl>

            {formError && <ErrorState>{formError}</ErrorState>}

            <div className="transfer-modal__actions">
              <Button
                type="button"
                onClick={handleConfirmTransfer}
                disabled={isSubmitting}
                autoFocus
              >
                {isSubmitting ? 'Transfiriendo...' : 'Confirmar transferencia'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancelConfirmation}
                disabled={isSubmitting}
              >
                Volver y editar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {transferResult && (
        <div className="transfer-modal" role="presentation">
          <div className="transfer-modal__backdrop" />
          <Card
            className="transfer-modal__panel"
            aria-labelledby="transfer-success-title"
            role="dialog"
            aria-modal="true"
          >
            <p className="status-pill status-pill--success">Transferencia exitosa</p>
            <h2 id="transfer-success-title">Operacion completada</h2>
            <div className="transfer-success" role="status">
              <strong>{formatCurrency(transferResult.amount)}</strong>
              <p>{transferResult.recipientName}</p>
              <p>{transferResult.recipientEmail}</p>
              <p>{formatTransactionDate(transferResult.createdAt)}</p>
              <p>
                Operacion: {getShortOperationId(transferResult.movementId)}
              </p>
            </div>
            <div className="transfer-modal__actions">
              <Button type="button" onClick={onViewTransactions}>
                Ver historial
              </Button>
              <Button type="button" variant="secondary" onClick={onGoDashboard}>
                Volver al dashboard
              </Button>
              <Button type="button" variant="secondary" onClick={handleNewTransfer}>
                Nueva transferencia
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default TransferPage
