import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import LoginForm from './LoginForm'

const INVALID_CREDENTIALS_MESSAGE =
  'El correo o la contrasena no son correctos.'

function renderLoginForm(props = {}) {
  const defaultProps = {
    getErrorMessage: () => INVALID_CREDENTIALS_MESSAGE,
    onLogin: vi.fn(),
  }

  return {
    props: {
      ...defaultProps,
      ...props,
    },
    ...render(<LoginForm {...defaultProps} {...props} />),
  }
}

async function completarLoginValido(user) {
  await user.type(screen.getByLabelText(/correo/i), 'Usuario@mycodebank.cl')
  await user.type(screen.getByLabelText(/^contrasena$/i), 'clave-secreta')
}

describe('LoginForm', () => {
  it('renderiza los campos de correo, contrasena y boton de iniciar sesion', () => {
    // Arrange
    renderLoginForm()

    // Act
    const emailInput = screen.getByLabelText(/correo/i)
    const passwordInput = screen.getByLabelText(/^contrasena$/i)
    const submitButton = screen.getByRole('button', {
      name: /iniciar sesion/i,
    })

    // Assert
    expect(emailInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()
    expect(submitButton).toBeEnabled()
  })

  it('muestra errores con campos vacios y no llama a onLogin', async () => {
    // Arrange
    const user = userEvent.setup()
    const onLogin = vi.fn()
    renderLoginForm({ onLogin })

    // Act
    await user.click(screen.getByRole('button', { name: /iniciar sesion/i }))

    // Assert
    expect(screen.getByText('Ingresa tu correo.')).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu contrasena.')).toBeInTheDocument()
    expect(onLogin).not.toHaveBeenCalled()
  })

  it('muestra error con correo invalido y no llama a onLogin', async () => {
    // Arrange
    const user = userEvent.setup()
    const onLogin = vi.fn()
    renderLoginForm({ onLogin })

    // Act
    await user.type(screen.getByLabelText(/correo/i), 'correo-invalido')
    await user.type(screen.getByLabelText(/^contrasena$/i), 'clave-secreta')
    await user.click(screen.getByRole('button', { name: /iniciar sesion/i }))

    // Assert
    expect(screen.getByText('Ingresa un correo valido.')).toBeInTheDocument()
    expect(onLogin).not.toHaveBeenCalled()
  })

  it('llama a onLogin una vez con email y password validos', async () => {
    // Arrange
    const user = userEvent.setup()
    const onLogin = vi.fn()
    renderLoginForm({ onLogin })

    // Act
    await completarLoginValido(user)
    await user.click(screen.getByRole('button', { name: /iniciar sesion/i }))

    // Assert
    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledTimes(1)
    })
    expect(onLogin).toHaveBeenCalledWith({
      email: 'usuario@mycodebank.cl',
      password: 'clave-secreta',
    })
  })

  it('muestra error si onLogin rechaza por credenciales invalidas', async () => {
    // Arrange
    const user = userEvent.setup()
    const onLogin = vi.fn().mockRejectedValue({
      code: 'auth/invalid-credential',
    })
    renderLoginForm({ onLogin })

    // Act
    await completarLoginValido(user)
    await user.click(screen.getByRole('button', { name: /iniciar sesion/i }))

    // Assert
    expect(await screen.findByText(INVALID_CREDENTIALS_MESSAGE)).toBeInTheDocument()
    expect(onLogin).toHaveBeenCalledTimes(1)
  })

  it('deshabilita el boton mientras onLogin esta pendiente y evita doble submit', async () => {
    // Arrange
    const user = userEvent.setup()
    let resolveLogin
    const onLogin = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve
        }),
    )
    renderLoginForm({ onLogin })

    // Act
    await completarLoginValido(user)
    const submitButton = screen.getByRole('button', { name: /iniciar sesion/i })
    await user.click(submitButton)
    await user.click(submitButton)

    // Assert
    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    })
    expect(onLogin).toHaveBeenCalledTimes(1)

    resolveLogin()
    await waitFor(() => {
      expect(submitButton).toBeEnabled()
    })
  })
})
