import { useState } from 'react'
import Button from '../ui/Button'
import ErrorState from '../ui/ErrorState'
import Input from '../ui/Input'

const initialFormState = {
  email: '',
  password: '',
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const defaultLoginErrorMessage =
  'No fue posible iniciar sesion. Intentalo nuevamente.'

function validateLoginForm(formValues) {
  const fieldErrors = {}
  const emailNormalizado = formValues.email.trim().toLowerCase()

  if (!emailNormalizado) {
    fieldErrors.email = 'Ingresa tu correo.'
  } else if (!emailPattern.test(emailNormalizado)) {
    fieldErrors.email = 'Ingresa un correo valido.'
  }

  if (!formValues.password) {
    fieldErrors.password = 'Ingresa tu contrasena.'
  }

  return fieldErrors
}

function LoginForm({
  error = '',
  getErrorMessage = () => defaultLoginErrorMessage,
  isSubmitting: externalSubmitting = false,
  onLogin,
  onOperationEnd = () => {},
  onOperationStart = () => {},
}) {
  const [formValues, setFormValues] = useState(initialFormState)
  const [fieldErrors, setFieldErrors] = useState({})
  const [errorMessage, setErrorMessage] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isBusy = externalSubmitting || isSubmitting
  const visibleErrorMessage = error || errorMessage

  function handleEmailChange(event) {
    setFormValues((currentValues) => ({
      ...currentValues,
      email: event.target.value,
    }))
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      email: '',
    }))
  }

  function handlePasswordChange(event) {
    setFormValues((currentValues) => ({
      ...currentValues,
      password: event.target.value,
    }))
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      password: '',
    }))
  }

  function handleTogglePasswordVisibility() {
    setIsPasswordVisible((isVisible) => !isVisible)
  }

  async function handleLoginSubmit(event) {
    event.preventDefault()

    if (isBusy) {
      return
    }

    setErrorMessage('')

    const validationErrors = validateLoginForm(formValues)

    if (Object.values(validationErrors).some(Boolean)) {
      setFieldErrors(validationErrors)
      return
    }

    setFieldErrors({})
    setIsSubmitting(true)
    onOperationStart()

    try {
      await onLogin({
        email: formValues.email.trim().toLowerCase(),
        password: formValues.password,
      })
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
      onOperationEnd()
    }
  }

  return (
    <form
      className="auth-form"
      onSubmit={handleLoginSubmit}
      noValidate
      aria-busy={isBusy}
    >
      <Input
        id="login-email"
        label="Correo"
        name="email"
        type="email"
        value={formValues.email}
        onChange={handleEmailChange}
        disabled={isBusy}
        autoComplete="email"
        errorMessage={fieldErrors.email}
        required
      />

      <Input
        id="login-password"
        label="Contrasena"
        name="password"
        type={isPasswordVisible ? 'text' : 'password'}
        value={formValues.password}
        onChange={handlePasswordChange}
        disabled={isBusy}
        autoComplete="current-password"
        errorMessage={fieldErrors.password}
        action={
          <button
            type="button"
            className="password-toggle"
            onClick={handleTogglePasswordVisibility}
            disabled={isBusy}
            aria-label={
              isPasswordVisible ? 'Ocultar contrasena' : 'Mostrar contrasena'
            }
          >
            {isPasswordVisible ? 'Ocultar' : 'Mostrar'}
          </button>
        }
        required
      />

      {visibleErrorMessage && (
        <ErrorState id="login-form-error">{visibleErrorMessage}</ErrorState>
      )}

      <Button
        type="submit"
        disabled={isBusy}
        aria-describedby={visibleErrorMessage ? 'login-form-error' : undefined}
      >
        {isBusy ? 'Ingresando...' : 'Iniciar sesion'}
      </Button>
    </form>
  )
}

export default LoginForm
