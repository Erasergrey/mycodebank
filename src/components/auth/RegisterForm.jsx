import { useState } from 'react'
import { registerUser } from '../../services/authService'
import { getFirebaseErrorMessage } from '../../services/firebaseErrors'

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

function RegisterForm() {
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
    }
  }

  return (
    <form className="auth-form" onSubmit={handleRegisterSubmit} noValidate>
      <div className="field-group">
        <label htmlFor="register-name">Nombre</label>
        <input
          id="register-name"
          name="nombre"
          type="text"
          value={formValues.nombre}
          onChange={handleInputChange}
          disabled={isSubmitting}
          autoComplete="name"
          minLength="2"
          required
        />
      </div>

      <div className="field-group">
        <label htmlFor="register-email">Correo</label>
        <input
          id="register-email"
          name="email"
          type="email"
          value={formValues.email}
          onChange={handleInputChange}
          disabled={isSubmitting}
          autoComplete="email"
          required
        />
      </div>

      <div className="field-group">
        <label htmlFor="register-password">Contrasena</label>
        <input
          id="register-password"
          name="password"
          type="password"
          value={formValues.password}
          onChange={handleInputChange}
          disabled={isSubmitting}
          autoComplete="new-password"
          minLength="6"
          required
        />
      </div>

      <div className="field-group">
        <label htmlFor="register-confirm-password">Confirmar contrasena</label>
        <input
          id="register-confirm-password"
          name="confirmPassword"
          type="password"
          value={formValues.confirmPassword}
          onChange={handleInputChange}
          disabled={isSubmitting}
          autoComplete="new-password"
          minLength="6"
          required
        />
      </div>

      {errorMessage && (
        <p className="feedback-message feedback-message--error" role="alert">
          {errorMessage}
        </p>
      )}

      <button className="primary-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
    </form>
  )
}

export default RegisterForm
