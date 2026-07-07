import { useState } from 'react'
import { registerUser } from '../../services/authService'
import { getFirebaseErrorMessage } from '../../services/firebaseErrors'
import Button from '../ui/Button'
import ErrorState from '../ui/ErrorState'
import Input from '../ui/Input'

const initialFormState = {
  nombre: '',
  email: '',
  password: '',
  confirmPassword: '',
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateRegisterForm(formValues) {
  const fieldErrors = {}
  const nombreLimpio = formValues.nombre.trim()
  const emailNormalizado = formValues.email.trim().toLowerCase()

  if (!nombreLimpio) {
    fieldErrors.nombre = 'Ingresa tu nombre.'
  } else if (nombreLimpio.length < 2) {
    fieldErrors.nombre = 'Ingresa un nombre de al menos 2 caracteres.'
  }

  if (!emailNormalizado) {
    fieldErrors.email = 'Ingresa tu correo.'
  } else if (!emailPattern.test(emailNormalizado)) {
    fieldErrors.email = 'Ingresa un correo valido.'
  }

  if (!formValues.password) {
    fieldErrors.password = 'Ingresa una contrasena.'
  } else if (formValues.password.length < 6) {
    fieldErrors.password = 'La contrasena debe tener al menos 6 caracteres.'
  }

  if (!formValues.confirmPassword) {
    fieldErrors.confirmPassword = 'Confirma tu contrasena.'
  } else if (formValues.password !== formValues.confirmPassword) {
    fieldErrors.confirmPassword = 'Las contrasenas no coinciden.'
  }

  return fieldErrors
}

function RegisterForm({ onOperationEnd, onOperationStart }) {
  const [formValues, setFormValues] = useState(initialFormState)
  const [fieldErrors, setFieldErrors] = useState({})
  const [errorMessage, setErrorMessage] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateFieldValue(fieldName, value) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [fieldName]: value,
    }))
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: '',
    }))
  }

  function handleNameChange(event) {
    updateFieldValue('nombre', event.target.value)
  }

  function handleEmailChange(event) {
    updateFieldValue('email', event.target.value)
  }

  function handlePasswordChange(event) {
    updateFieldValue('password', event.target.value)
  }

  function handleConfirmPasswordChange(event) {
    updateFieldValue('confirmPassword', event.target.value)
  }

  function handleTogglePasswordVisibility() {
    setIsPasswordVisible((isVisible) => !isVisible)
  }

  function handleToggleConfirmPasswordVisibility() {
    setIsConfirmPasswordVisible((isVisible) => !isVisible)
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    setErrorMessage('')

    const validationErrors = validateRegisterForm(formValues)

    if (Object.values(validationErrors).some(Boolean)) {
      setFieldErrors(validationErrors)
      return
    }

    setFieldErrors({})
    setIsSubmitting(true)
    onOperationStart()

    try {
      await registerUser({
        nombre: formValues.nombre.trim(),
        email: formValues.email.trim().toLowerCase(),
        password: formValues.password,
      })

      setFormValues((currentValues) => ({
        ...currentValues,
        password: '',
        confirmPassword: '',
      }))
    } catch (error) {
      setErrorMessage(getFirebaseErrorMessage(error))
    } finally {
      setIsSubmitting(false)
      onOperationEnd()
    }
  }

  return (
    <form
      className="auth-form"
      onSubmit={handleRegisterSubmit}
      noValidate
      aria-busy={isSubmitting}
    >
      <Input
        id="register-name"
        label="Nombre"
        name="nombre"
        type="text"
        value={formValues.nombre}
        onChange={handleNameChange}
        disabled={isSubmitting}
        autoComplete="name"
        errorMessage={fieldErrors.nombre}
        minLength="2"
        required
      />

      <Input
        id="register-email"
        label="Correo"
        name="email"
        type="email"
        value={formValues.email}
        onChange={handleEmailChange}
        disabled={isSubmitting}
        autoComplete="email"
        errorMessage={fieldErrors.email}
        required
      />

      <Input
        id="register-password"
        label="Contrasena"
        name="password"
        type={isPasswordVisible ? 'text' : 'password'}
        value={formValues.password}
        onChange={handlePasswordChange}
        disabled={isSubmitting}
        autoComplete="new-password"
        errorMessage={fieldErrors.password}
        minLength="6"
        action={
          <button
            type="button"
            className="password-toggle"
            onClick={handleTogglePasswordVisibility}
            disabled={isSubmitting}
            aria-label={
              isPasswordVisible ? 'Ocultar contrasena' : 'Mostrar contrasena'
            }
          >
            {isPasswordVisible ? 'Ocultar' : 'Mostrar'}
          </button>
        }
        required
      />

      <Input
        id="register-confirm-password"
        label="Confirmar contrasena"
        name="confirmPassword"
        type={isConfirmPasswordVisible ? 'text' : 'password'}
        value={formValues.confirmPassword}
        onChange={handleConfirmPasswordChange}
        disabled={isSubmitting}
        autoComplete="new-password"
        errorMessage={fieldErrors.confirmPassword}
        minLength="6"
        action={
          <button
            type="button"
            className="password-toggle"
            onClick={handleToggleConfirmPasswordVisibility}
            disabled={isSubmitting}
            aria-label={
              isConfirmPasswordVisible
                ? 'Ocultar confirmacion de contrasena'
                : 'Mostrar confirmacion de contrasena'
            }
          >
            {isConfirmPasswordVisible ? 'Ocultar' : 'Mostrar'}
          </button>
        }
        required
      />

      {errorMessage && (
        <ErrorState id="register-form-error">{errorMessage}</ErrorState>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        aria-describedby={errorMessage ? 'register-form-error' : undefined}
      >
        {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
      </Button>
    </form>
  )
}

export default RegisterForm
