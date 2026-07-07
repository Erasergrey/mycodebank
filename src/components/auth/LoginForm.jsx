import { useState } from 'react'
import { loginUser } from '../../services/authService'
import { getFirebaseErrorMessage } from '../../services/firebaseErrors'

const initialFormState = {
  email: '',
  password: '',
}

function validateLoginForm(formValues) {
  if (!formValues.email.trim()) {
    return 'Ingresa tu correo.'
  }

  if (!formValues.password) {
    return 'Ingresa tu contrasena.'
  }

  return ''
}

function LoginForm({ onOperationEnd, onOperationStart }) {
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

  async function handleLoginSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    const validationError = validateLoginForm(formValues)

    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    setIsSubmitting(true)
    onOperationStart()

    try {
      await loginUser({
        email: formValues.email,
        password: formValues.password,
      })
    } catch (error) {
      setErrorMessage(getFirebaseErrorMessage(error))
    } finally {
      setIsSubmitting(false)
      onOperationEnd()
    }
  }

  return (
    <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
      <div className="field-group">
        <label htmlFor="login-email">Correo</label>
        <input
          id="login-email"
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
        <label htmlFor="login-password">Contrasena</label>
        <input
          id="login-password"
          name="password"
          type="password"
          value={formValues.password}
          onChange={handleInputChange}
          disabled={isSubmitting}
          autoComplete="current-password"
          required
        />
      </div>

      {errorMessage && (
        <p className="feedback-message feedback-message--error" role="alert">
          {errorMessage}
        </p>
      )}

      <button className="primary-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Ingresando...' : 'Iniciar sesion'}
      </button>
    </form>
  )
}

export default LoginForm
