import { useEffect, useState } from 'react'
import Button from '../ui/Button'
import ErrorState from '../ui/ErrorState'
import Input from '../ui/Input'
import {
  esEmailValido,
  mensajesValidacionTransferencia,
  normalizarEmail,
  validarTransferencia,
} from '../../utils/validaciones'
import { getInitials } from '../../utils/userDisplay'

const initialFormState = {
  recipientEmail: '',
  amount: '',
  description: '',
}

const DESCRIPTION_MAX_LENGTH = 120
const DESCRIPTION_MAX_LENGTH_ERROR =
  'La descripcion puede tener hasta 120 caracteres.'

function limpiarDescripcion(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function mapValidationErrors(errors) {
  return {
    amount: errors.monto ?? '',
    recipientEmail: errors.emailDestino ?? '',
    form: errors.saldoDisponible ?? '',
  }
}

function TransferForm({
  emailUsuarioActual = '',
  errorInicial = '',
  externalError = '',
  externalFieldErrors = {},
  isBalanceLoading = false,
  isSearchingRecipient = false,
  isSubmitting = false,
  onClearExternalErrors,
  onRecipientReset,
  onSearchRecipient,
  onTransfer,
  recipient = null,
  resetKey = 0,
  saldoDisponible,
}) {
  const [formValues, setFormValues] = useState(initialFormState)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState(errorInicial)
  const [isTransferPending, setIsTransferPending] = useState(false)

  useEffect(() => {
    setFormValues(initialFormState)
    setFieldErrors({})
    setFormError(errorInicial)
  }, [errorInicial, resetKey])

  const hasUsableBalance =
    typeof saldoDisponible === 'number' && Number.isFinite(saldoDisponible)
  const isBusy = isSubmitting || isSearchingRecipient || isTransferPending
  const canSubmit = !isBalanceLoading && !isBusy && hasUsableBalance
  const visibleFormError = externalError || formError
  const visibleFieldErrors = {
    amount: externalFieldErrors.amount || fieldErrors.amount,
    recipientEmail:
      externalFieldErrors.recipientEmail || fieldErrors.recipientEmail,
    description: externalFieldErrors.description || fieldErrors.description,
  }

  function clearErrorsForField(fieldName) {
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: '',
      form: '',
    }))
    setFormError('')
    onClearExternalErrors?.()
  }

  function updateFieldValue(fieldName, value) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [fieldName]: value,
    }))
    clearErrorsForField(fieldName)
  }

  function handleRecipientChange(event) {
    updateFieldValue('recipientEmail', event.target.value)
    onRecipientReset?.()
  }

  function handleRecipientBlur() {
    const normalizedRecipientEmail = normalizarEmail(formValues.recipientEmail)

    if (!normalizedRecipientEmail || esEmailValido(normalizedRecipientEmail)) {
      return
    }

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      recipientEmail: mensajesValidacionTransferencia.emailInvalido,
    }))
  }

  function handleAmountChange(event) {
    updateFieldValue('amount', event.target.value)
  }

  function handleDescriptionChange(event) {
    updateFieldValue('description', event.target.value)
  }

  async function handleSearchRecipient() {
    if (isBusy || !onSearchRecipient) {
      return
    }

    const normalizedRecipientEmail = normalizarEmail(formValues.recipientEmail)

    if (!normalizedRecipientEmail || !esEmailValido(normalizedRecipientEmail)) {
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        recipientEmail: mensajesValidacionTransferencia.emailInvalido,
      }))
      return
    }

    setFormError('')
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      recipientEmail: '',
    }))
    onClearExternalErrors?.()
    await onSearchRecipient(normalizedRecipientEmail)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (isBusy) {
      return
    }

    const validation = validarTransferencia({
      monto: formValues.amount,
      saldoDisponible,
      emailDestino: formValues.recipientEmail,
      emailUsuarioActual,
    })
    const nextErrors = mapValidationErrors(validation.errores)
    const description = limpiarDescripcion(formValues.description)

    if (description.length > DESCRIPTION_MAX_LENGTH) {
      nextErrors.description = DESCRIPTION_MAX_LENGTH_ERROR
    }

    if (!validation.valido || nextErrors.description) {
      setFieldErrors(nextErrors)
      setFormError(nextErrors.form || '')
      return
    }

    setFormError('')
    setFieldErrors({})
    onClearExternalErrors?.()
    setIsTransferPending(true)

    try {
      await onTransfer?.({
        monto: Number(String(formValues.amount).trim()),
        emailDestino: normalizarEmail(formValues.recipientEmail),
        descripcion: description,
      })
    } finally {
      setIsTransferPending(false)
    }
  }

  return (
    <>
      {visibleFormError && (
        <ErrorState id="transfer-form-error">{visibleFormError}</ErrorState>
      )}

      <form
        className="transfer-form"
        onSubmit={handleSubmit}
        noValidate
        aria-busy={isSearchingRecipient || isSubmitting || isTransferPending}
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
          errorMessage={visibleFieldErrors.recipientEmail}
          action={
            <button
              type="button"
              className="transfer-inline-button"
              onClick={handleSearchRecipient}
              disabled={isBusy}
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
          errorMessage={visibleFieldErrors.amount}
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
              visibleFieldErrors.description
                ? 'transfer-description-error'
                : 'transfer-description-help'
            }
            aria-invalid={visibleFieldErrors.description ? 'true' : undefined}
          />
          <p className="transfer-form__hint" id="transfer-description-help">
            {formValues.description.length}/{DESCRIPTION_MAX_LENGTH}
          </p>
          {visibleFieldErrors.description && (
            <p className="field-error" id="transfer-description-error">
              {visibleFieldErrors.description}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={!canSubmit}
          aria-describedby={visibleFormError ? 'transfer-form-error' : undefined}
        >
          {isSearchingRecipient ? 'Buscando destinatario...' : 'Continuar'}
        </Button>
      </form>
    </>
  )
}

export default TransferForm
