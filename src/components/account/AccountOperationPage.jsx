import { useEffect, useState } from 'react'
import {
  depositMoney,
  getAccountOperationErrorMessage,
  MAX_SIMULATED_OPERATION_AMOUNT,
  normalizeAccountOperationDescription,
  OPERATION_DESCRIPTION_MAX_LENGTH,
  parseAccountOperationAmount,
  withdrawMoney,
} from '../../services/accountOperationsService'
import { formatCurrency, formatTransactionDate } from '../../utils/formatters'
import LayoutIcon from '../layout/LayoutIcon'
import Button from '../ui/Button'
import Card from '../ui/Card'
import ErrorState from '../ui/ErrorState'
import Input from '../ui/Input'

const initialFormState = {
  amount: '',
  description: '',
}

const OPERATION_CONFIG = {
  deposit: {
    actionLabel: 'Confirmar deposito',
    confirmTitle: 'Revisa el deposito',
    icon: 'deposit',
    kicker: 'Operacion simulada',
    pageTitle: 'Depositar',
    resultLabel: 'Deposito completado',
    submitLabel: 'Continuar deposito',
    successClass: 'transfer-success--positive',
    typeLabel: 'Deposito simulado',
    execute: depositMoney,
    getEstimatedBalance: (balance, amount) => balance + amount,
  },
  withdrawal: {
    actionLabel: 'Confirmar retiro',
    confirmTitle: 'Revisa el retiro',
    icon: 'withdraw',
    kicker: 'Operacion simulada',
    pageTitle: 'Retirar',
    resultLabel: 'Retiro completado',
    submitLabel: 'Continuar retiro',
    successClass: 'transfer-success--negative',
    typeLabel: 'Retiro simulado',
    execute: withdrawMoney,
    getEstimatedBalance: (balance, amount) => balance - amount,
  },
}

function getVisibleBalance(profile) {
  return typeof profile?.saldo === 'number' && Number.isFinite(profile.saldo)
    ? profile.saldo
    : null
}

function getShortOperationId(value) {
  if (!value) {
    return 'No disponible'
  }

  return value.slice(0, 8).toUpperCase()
}

function AccountOperationPage({
  currentUser,
  operationType,
  onGoDashboard,
  onViewTransactions,
  profile,
  profileLoading,
}) {
  const config = OPERATION_CONFIG[operationType] ?? OPERATION_CONFIG.deposit
  const [formValues, setFormValues] = useState(initialFormState)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [confirmation, setConfirmation] = useState(null)
  const [operationResult, setOperationResult] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isWithdrawalOperation = operationType === 'withdrawal'
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

      if (operationResult) {
        setOperationResult(null)
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [confirmation, isSubmitting, operationResult])

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

  function handleDepositAmountChange(event) {
    updateFieldValue('amount', event.target.value)
  }

  function handleWithdrawAmountChange(event) {
    updateFieldValue('amount', event.target.value)
  }

  function handleDepositDescriptionChange(event) {
    updateFieldValue('description', event.target.value)
  }

  function handleWithdrawDescriptionChange(event) {
    updateFieldValue('description', event.target.value)
  }

  function validateForm() {
    const errors = {}

    if (!currentUser?.uid) {
      errors.form = 'Tu sesion expiro. Inicia sesion nuevamente.'
    }

    if (!hasUsableBalance && !profileLoading) {
      errors.form = 'No pudimos interpretar el saldo actual de tu cuenta.'
    }

    try {
      const amount = parseAccountOperationAmount(formValues.amount)

      if (isWithdrawalOperation && hasUsableBalance && amount > visibleBalance) {
        errors.amount = 'No tienes saldo suficiente para realizar este retiro.'
      }
    } catch (error) {
      errors.amount = getAccountOperationErrorMessage(error)
    }

    try {
      normalizeAccountOperationDescription(formValues.description)
    } catch (error) {
      errors.description = getAccountOperationErrorMessage(error)
    }

    return errors
  }

  function handleOperationSubmit(event) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    setFormError('')
    setOperationResult(null)

    const validationErrors = validateForm()

    if (Object.values(validationErrors).some(Boolean)) {
      setFieldErrors(validationErrors)
      setFormError(validationErrors.form ?? '')
      return
    }

    const amount = parseAccountOperationAmount(formValues.amount)
    const description = normalizeAccountOperationDescription(
      formValues.description,
    )
    const estimatedBalance = config.getEstimatedBalance(visibleBalance, amount)

    if (!Number.isSafeInteger(estimatedBalance) || estimatedBalance < 0) {
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        amount: 'No pudimos calcular el saldo estimado.',
      }))
      return
    }

    setFieldErrors({})
    setConfirmation({
      amount,
      description,
      estimatedBalance,
      visibleBalance,
    })
  }

  function handleDepositSubmit(event) {
    handleOperationSubmit(event)
  }

  function handleWithdrawSubmit(event) {
    handleOperationSubmit(event)
  }

  function handleCancelConfirmation() {
    if (isSubmitting) {
      return
    }

    setConfirmation(null)
    setFormError('')
  }

  async function handleConfirmOperation() {
    if (isSubmitting || !confirmation) {
      return
    }

    setIsSubmitting(true)
    setFormError('')

    try {
      const result = await config.execute({
        amount: confirmation.amount,
        description: confirmation.description,
        expectedBalance: isWithdrawalOperation
          ? confirmation.visibleBalance
          : undefined,
        userUid: currentUser?.uid,
      })

      setConfirmation(null)
      setOperationResult(result)
      setFormValues(initialFormState)
      setFieldErrors({})
    } catch (error) {
      setFormError(getAccountOperationErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleConfirmDeposit() {
    return handleConfirmOperation()
  }

  function handleConfirmWithdraw() {
    return handleConfirmOperation()
  }

  function handleNewOperation() {
    setOperationResult(null)
    setFormError('')
  }

  const canSubmit = !profileLoading && !isSubmitting && hasUsableBalance
  const handleAmountChange = isWithdrawalOperation
    ? handleWithdrawAmountChange
    : handleDepositAmountChange
  const handleDescriptionChange = isWithdrawalOperation
    ? handleWithdrawDescriptionChange
    : handleDepositDescriptionChange
  const handleSubmit = isWithdrawalOperation
    ? handleWithdrawSubmit
    : handleDepositSubmit
  const handleConfirm = isWithdrawalOperation
    ? handleConfirmWithdraw
    : handleConfirmDeposit

  return (
    <div className="transfer-page">
      <Card className="transfer-panel" aria-labelledby="account-operation-title">
        <div className="dashboard-section-heading">
          <p className="dashboard-kicker">{config.kicker}</p>
          <h2 id="account-operation-title">{config.pageTitle}</h2>
        </div>

        <div className="transfer-education-note">
          Esta funcion es parte de un proyecto educativo. No mueve dinero real
          ni se conecta con instituciones financieras.
        </div>

        <div className="transfer-balance-summary">
          <span className="transfer-balance-summary__icon">
            <LayoutIcon name={config.icon} />
          </span>
          <div>
            <p>Saldo disponible</p>
            <strong>
              {hasUsableBalance ? formatCurrency(visibleBalance) : 'No disponible'}
            </strong>
          </div>
        </div>

        {formError && (
          <ErrorState id="account-operation-form-error">{formError}</ErrorState>
        )}

        <form
          className="transfer-form"
          onSubmit={handleSubmit}
          noValidate
          aria-busy={isSubmitting}
        >
          <Input
            id="account-operation-amount"
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
            <label htmlFor="account-operation-description">Descripcion</label>
            <textarea
              id="account-operation-description"
              className="ui-input transfer-form__textarea"
              name="description"
              value={formValues.description}
              onChange={handleDescriptionChange}
              disabled={isSubmitting}
              maxLength={OPERATION_DESCRIPTION_MAX_LENGTH}
              aria-describedby={
                fieldErrors.description
                  ? 'account-operation-description-error'
                  : 'account-operation-description-help'
              }
              aria-invalid={fieldErrors.description ? 'true' : undefined}
            />
            <p
              className="transfer-form__hint"
              id="account-operation-description-help"
            >
              {formValues.description.length}/{OPERATION_DESCRIPTION_MAX_LENGTH}
            </p>
            {fieldErrors.description && (
              <p className="field-error" id="account-operation-description-error">
                {fieldErrors.description}
              </p>
            )}
          </div>

          <p className="transfer-form__hint">
            Limite por operacion simulada:{' '}
            {formatCurrency(MAX_SIMULATED_OPERATION_AMOUNT)}
          </p>

          <Button
            type="submit"
            disabled={!canSubmit}
            aria-describedby={
              formError ? 'account-operation-form-error' : undefined
            }
          >
            {config.submitLabel}
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
            aria-labelledby="account-operation-confirm-title"
            role="dialog"
            aria-modal="true"
          >
            <p className="dashboard-kicker">Confirmacion</p>
            <h2 id="account-operation-confirm-title">{config.confirmTitle}</h2>
            <div className="transfer-education-note">
              Esta es una operacion simulada y no representa dinero real.
            </div>
            <dl className="transfer-confirmation-list">
              <div>
                <dt>Tipo</dt>
                <dd>{config.typeLabel}</dd>
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
                onClick={handleConfirm}
                disabled={isSubmitting}
                autoFocus
              >
                {isSubmitting && (
                  <span className="transfer-button-spinner" aria-hidden="true" />
                )}
                <span>
                  {isSubmitting ? 'Procesando...' : config.actionLabel}
                </span>
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

      {operationResult && (
        <div className="transfer-modal" role="presentation">
          <div className="transfer-modal__backdrop" />
          <Card
            className="transfer-modal__panel"
            aria-labelledby="account-operation-success-title"
            role="dialog"
            aria-modal="true"
          >
            <p className="status-pill status-pill--success">
              {config.resultLabel}
            </p>
            <h2 id="account-operation-success-title">Operacion completada</h2>
            <div
              className={`transfer-success ${config.successClass}`}
              role="status"
            >
              <strong>{formatCurrency(operationResult.amount)}</strong>
              <p>Saldo resultante: {formatCurrency(operationResult.newBalance)}</p>
              <p>{formatTransactionDate(operationResult.createdAt)}</p>
              <p>
                Operacion: {getShortOperationId(operationResult.movementId)}
              </p>
              <p>Operacion simulada: no representa dinero real.</p>
            </div>
            <div className="transfer-modal__actions">
              <Button type="button" onClick={onViewTransactions}>
                Ver historial
              </Button>
              <Button type="button" variant="secondary" onClick={onGoDashboard}>
                Volver al dashboard
              </Button>
              <Button type="button" variant="secondary" onClick={handleNewOperation}>
                Nueva operacion
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default AccountOperationPage
