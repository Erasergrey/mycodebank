import { useEffect, useState } from 'react'
import LayoutIcon from '../components/layout/LayoutIcon'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ErrorState from '../components/ui/ErrorState'
import Input from '../components/ui/Input'
import {
  findRecipientByEmail,
  getTransferErrorMessage,
  isValidTransferEmail,
  normalizeEmail,
  normalizeTransferDescription,
  parseTransferAmount,
  transferMoney,
  TransferError,
} from '../services/transferService'
import { formatCurrency, formatTransactionDate } from '../utils/formatters'
import { getInitials } from '../utils/userDisplay'

const initialFormState = {
  recipientEmail: '',
  amount: '',
  description: '',
}

const DESCRIPTION_MAX_LENGTH = 120

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
  const [formValues, setFormValues] = useState(initialFormState)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
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

  function updateFieldValue(fieldName, value) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [fieldName]: value,
    }))
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: '',
    }))
    setFormError('')
  }

  function handleRecipientChange(event) {
    updateFieldValue('recipientEmail', event.target.value)
    setRecipient(null)
    setRecipientLookupEmail('')
  }

  function handleRecipientBlur() {
    const normalizedRecipientEmail = normalizeEmail(formValues.recipientEmail)

    if (!normalizedRecipientEmail || isValidTransferEmail(normalizedRecipientEmail)) {
      return
    }

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      recipientEmail: 'Ingresa un correo valido.',
    }))
  }

  function handleAmountChange(event) {
    updateFieldValue('amount', event.target.value)
  }

  function handleDescriptionChange(event) {
    updateFieldValue('description', event.target.value)
  }

  function validateBaseForm() {
    const errors = {}
    const normalizedRecipientEmail = normalizeEmail(formValues.recipientEmail)

    if (!currentUser?.uid) {
      errors.form = 'Inicia sesion para realizar una transferencia.'
    }

    if (!normalizedRecipientEmail) {
      errors.recipientEmail = 'Ingresa el correo del destinatario.'
    } else if (!isValidTransferEmail(normalizedRecipientEmail)) {
      errors.recipientEmail = 'Ingresa un correo valido.'
    }

    try {
      parseTransferAmount(formValues.amount)
    } catch (error) {
      errors.amount = getTransferErrorMessage(error)
    }

    try {
      normalizeTransferDescription(formValues.description)
    } catch (error) {
      errors.description = getTransferErrorMessage(error)
    }

    if (!hasUsableBalance && !profileLoading) {
      errors.form = 'No pudimos validar tu saldo disponible.'
    }

    return errors
  }

  async function resolveRecipient() {
    const normalizedRecipientEmail = normalizeEmail(formValues.recipientEmail)

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

  async function handleSearchRecipient() {
    if (isSearchingRecipient) {
      return
    }

    const normalizedRecipientEmail = normalizeEmail(formValues.recipientEmail)

    if (!normalizedRecipientEmail || !isValidTransferEmail(normalizedRecipientEmail)) {
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        recipientEmail: 'Ingresa un correo valido.',
      }))
      return
    }

    setFormError('')
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      recipientEmail: '',
    }))

    try {
      await resolveRecipient()
    } catch (error) {
      setRecipient(null)
      setRecipientLookupEmail('')
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        recipientEmail: getTransferErrorMessage(error),
      }))
    }
  }

  async function handleTransferSubmit(event) {
    event.preventDefault()

    if (isSubmitting || isSearchingRecipient) {
      return
    }

    setFormError('')
    setTransferResult(null)

    const validationErrors = validateBaseForm()

    if (Object.values(validationErrors).some(Boolean)) {
      setFieldErrors(validationErrors)
      setFormError(validationErrors.form ?? '')
      return
    }

    const amount = parseTransferAmount(formValues.amount)

    if (hasUsableBalance && amount > visibleBalance) {
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        amount: 'No tienes saldo suficiente para este monto.',
      }))
      return
    }

    try {
      const foundRecipient = await resolveRecipient()
      const description = normalizeTransferDescription(formValues.description)

      setFieldErrors({})
      setConfirmation({
        amount,
        description,
        estimatedBalance: visibleBalance - amount,
        recipient: foundRecipient,
        visibleBalance,
      })
    } catch (error) {
      setRecipient(null)
      setRecipientLookupEmail('')
      setFieldErrors((currentErrors) => ({
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
      setFormValues(initialFormState)
      setFieldErrors({})
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

  const canSubmit =
    !profileLoading &&
    !isSearchingRecipient &&
    !isSubmitting &&
    hasUsableBalance

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

        {formError && <ErrorState id="transfer-form-error">{formError}</ErrorState>}

        <form
          className="transfer-form"
          onSubmit={handleTransferSubmit}
          noValidate
          aria-busy={isSearchingRecipient || isSubmitting}
        >
          <Input
            id="transfer-recipient"
            label="Correo del destinatario"
            name="recipientEmail"
            type="email"
            value={formValues.recipientEmail}
            onChange={handleRecipientChange}
            onBlur={handleRecipientBlur}
            disabled={isSubmitting}
            autoComplete="email"
            errorMessage={fieldErrors.recipientEmail}
            action={
              <button
                type="button"
                className="transfer-inline-button"
                onClick={handleSearchRecipient}
                disabled={isSubmitting || isSearchingRecipient}
              >
                {isSearchingRecipient ? 'Buscando...' : 'Buscar'}
              </button>
            }
            required
          />

          {recipient && (
            <div className="transfer-recipient-card" role="status">
              <span className="transfer-recipient-card__avatar">
                {getInitials(recipient.name)}
              </span>
              <div>
                <strong>{recipient.name}</strong>
                <span>{recipient.email}</span>
              </div>
            </div>
          )}

          <Input
            id="transfer-amount"
            label="Monto"
            name="amount"
            type="text"
            inputMode="numeric"
            value={formValues.amount}
            onChange={handleAmountChange}
            disabled={isSubmitting}
            autoComplete="off"
            errorMessage={fieldErrors.amount}
            required
          />

          <div className="field-group">
            <label htmlFor="transfer-description">Descripcion</label>
            <textarea
              id="transfer-description"
              className="ui-input transfer-form__textarea"
              name="description"
              value={formValues.description}
              onChange={handleDescriptionChange}
              disabled={isSubmitting}
              maxLength={DESCRIPTION_MAX_LENGTH}
              aria-describedby={
                fieldErrors.description
                  ? 'transfer-description-error'
                  : 'transfer-description-help'
              }
              aria-invalid={fieldErrors.description ? 'true' : undefined}
            />
            <p className="transfer-form__hint" id="transfer-description-help">
              {formValues.description.length}/{DESCRIPTION_MAX_LENGTH}
            </p>
            {fieldErrors.description && (
              <p className="field-error" id="transfer-description-error">
                {fieldErrors.description}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={!canSubmit}
            aria-describedby={formError ? 'transfer-form-error' : undefined}
          >
            {isSearchingRecipient ? 'Buscando destinatario...' : 'Continuar'}
          </Button>
        </form>
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
