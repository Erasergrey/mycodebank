import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AUTH_MODES } from '../../config/auth'
import { loginUser } from '../../services/authService'
import AuthScreen from './AuthScreen'

vi.mock('../../services/authService', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}))

const INVALID_CREDENTIALS_MESSAGE =
  'El correo o la contrasena no son correctos.'

function renderAuthScreen(props = {}) {
  const defaultProps = {
    authError: '',
    authMode: AUTH_MODES.LOGIN,
    onOperationEnd: vi.fn(),
    onOperationStart: vi.fn(),
    onShowLogin: vi.fn(),
    onShowRegister: vi.fn(),
  }

  return {
    props: {
      ...defaultProps,
      ...props,
    },
    ...render(<AuthScreen {...defaultProps} {...props} />),
  }
}

function getLoginSubmitButton() {
  const loginButtons = screen.getAllByRole('button', {
    name: /^iniciar sesion$/i,
  })

  return loginButtons[loginButtons.length - 1]
}

async function completarFormularioLogin(user) {
  await user.type(screen.getByLabelText(/correo/i), 'Usuario@mycodebank.cl')
  await user.type(screen.getByLabelText(/^contrasena$/i), 'clave-segura')
}

describe('AuthScreen con authService mockeado', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('llama a loginUser con email y password cuando el mock resuelve con exito', async () => {
    // Arrange
    const user = userEvent.setup()
    loginUser.mockResolvedValueOnce({
      uid: 'user-123',
      email: 'usuario@mycodebank.cl',
    })

    renderAuthScreen()

    // Act
    await completarFormularioLogin(user)
    await user.click(getLoginSubmitButton())

    // Assert
    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledTimes(1)
    })
    expect(loginUser).toHaveBeenCalledWith({
      email: 'usuario@mycodebank.cl',
      password: 'clave-segura',
    })
    expect(screen.queryByText(INVALID_CREDENTIALS_MESSAGE)).not.toBeInTheDocument()
  })

  it('muestra error de credenciales cuando loginUser rechaza', async () => {
    // Arrange
    const user = userEvent.setup()
    loginUser.mockRejectedValueOnce({
      code: 'auth/invalid-credential',
    })

    renderAuthScreen()

    // Act
    await completarFormularioLogin(user)
    await user.click(getLoginSubmitButton())

    // Assert
    expect(await screen.findByText(INVALID_CREDENTIALS_MESSAGE)).toBeInTheDocument()
    expect(loginUser).toHaveBeenCalledTimes(1)
    expect(loginUser).toHaveBeenCalledWith({
      email: 'usuario@mycodebank.cl',
      password: 'clave-segura',
    })
  })
})
