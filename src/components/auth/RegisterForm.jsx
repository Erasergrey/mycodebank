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
  const nombreLimpio = formValues.nombre.trim()
  const emailNormalizado = formValues.email.trim().toLowerCase()

  if (nombreLimpio.length < 2) {
    return 'Ingresa un nombre de al menos 2 caracteres.'
  }

  if (!emailPattern.test(emailNormalizado)) {
    return 'Ingresa un correo valido.'
  }

  if (formValues.password.length < 6) {
    return 'La contrasena debe tener al menos 6 caracteres.'
  }

  if (formValues.password !== formValues.confirmPassword) {
    return 'Las contrasenas no coinciden.'
  }

  return ''
}

function RegisterForm({ onOperationEnd, onOperationStart }) {
  const [formValues, setFormValues] = useState(initialFormState)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleInputChange(event) {
    const { name, value } = event.target

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    const validationError = validateRegisterForm(formValues)

    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    setIsSubmitting(true)
    onOperationStart()

    try {
      await registerUser({
        nombre: formValues.nombre,
        email: formValues.email,
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
    <form className="auth-form" onSubmit={handleRegisterSubmit} noValidate>
      <Input
        id="register-name"
        label="Nombre"
        name="nombre"
        type="text"
        value={formValues.nombre}
        onChange={handleInputChange}
        disabled={isSubmitting}
        autoComplete="name"
        minLength="2"
        required
      />

      <Input
        id="register-email"
        label="Correo"
        name="email"
        type="email"
        value={formValues.email}
        onChange={handleInputChange}
        disabled={isSubmitting}
        autoComplete="email"
        required
      />

      <Input
        id="register-password"
        label="Contrasena"
        name="password"
        type="password"
        value={formValues.password}
        onChange={handleInputChange}
        disabled={isSubmitting}
        autoComplete="new-password"
        minLength="6"
        required
      />

      <Input
        id="register-confirm-password"
        label="Confirmar contrasena"
        name="confirmPassword"
        type="password"
        value={formValues.confirmPassword}
        onChange={handleInputChange}
        disabled={isSubmitting}
        autoComplete="new-password"
        minLength="6"
        required
      />

      {errorMessage && <ErrorState>{errorMessage}</ErrorState>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
      </Button>
    </form>
  )
}

export default RegisterForm
