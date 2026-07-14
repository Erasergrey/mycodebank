import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import TransferForm from './TransferForm'
import { mensajesValidacionTransferencia } from '../../utils/validaciones'

function renderTransferForm(props = {}) {
  const defaultProps = {
    saldoDisponible: 50000,
    emailUsuarioActual: 'usuario@mycodebank.cl',
    onTransfer: vi.fn(),
  }

  return {
    props: {
      ...defaultProps,
      ...props,
    },
    ...render(<TransferForm {...defaultProps} {...props} />),
  }
}

async function completarFormularioValido(user) {
  await user.type(
    screen.getByLabelText(/correo del destinatario/i),
    'Destino@mycodebank.cl',
  )
  await user.type(screen.getByLabelText(/monto/i), '15000')
  await user.type(screen.getByLabelText(/descripcion/i), 'Pago arriendo')
}

describe('TransferForm', () => {
  it('renderiza los campos y el boton de enviar', () => {
    // Arrange
    renderTransferForm()

    // Act
    const recipientInput = screen.getByLabelText(/correo del destinatario/i)
    const amountInput = screen.getByLabelText(/monto/i)
    const descriptionInput = screen.getByLabelText(/descripcion/i)
    const searchButton = screen.getByRole('button', { name: /buscar/i })
    const submitButton = screen.getByRole('button', { name: /continuar/i })

    // Assert
    expect(recipientInput).toBeInTheDocument()
    expect(amountInput).toBeInTheDocument()
    expect(descriptionInput).toBeInTheDocument()
    expect(searchButton).toBeInTheDocument()
    expect(submitButton).toBeEnabled()
  })

  it('muestra error al enviar un monto invalido y no llama a onTransfer', async () => {
    // Arrange
    const user = userEvent.setup()
    const onTransfer = vi.fn()
    renderTransferForm({ onTransfer })

    // Act
    await user.type(
      screen.getByLabelText(/correo del destinatario/i),
      'destino@mycodebank.cl',
    )
    await user.type(screen.getByLabelText(/monto/i), '-1000')
    await user.click(screen.getByRole('button', { name: /continuar/i }))

    // Assert
    expect(
      screen.getByText(mensajesValidacionTransferencia.montoMayorACero),
    ).toBeInTheDocument()
    expect(onTransfer).not.toHaveBeenCalled()
  })

  it('llama a onTransfer una vez con los datos validos', async () => {
    // Arrange
    const user = userEvent.setup()
    const onTransfer = vi.fn()
    renderTransferForm({ onTransfer })

    // Act
    await completarFormularioValido(user)
    await user.click(screen.getByRole('button', { name: /continuar/i }))

    // Assert
    await waitFor(() => {
      expect(onTransfer).toHaveBeenCalledTimes(1)
    })
    expect(onTransfer).toHaveBeenCalledWith({
      monto: 15000,
      emailDestino: 'destino@mycodebank.cl',
      descripcion: 'Pago arriendo',
    })
  })

  it('deshabilita el boton mientras transfiere y evita doble submit', async () => {
    // Arrange
    const user = userEvent.setup()
    let resolveTransfer
    const onTransfer = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveTransfer = resolve
        }),
    )
    renderTransferForm({ onTransfer })

    // Act
    await completarFormularioValido(user)
    const submitButton = screen.getByRole('button', { name: /continuar/i })
    await user.click(submitButton)
    await user.click(submitButton)

    // Assert
    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    })
    expect(onTransfer).toHaveBeenCalledTimes(1)

    resolveTransfer()
    await waitFor(() => {
      expect(submitButton).toBeEnabled()
    })
  })
})
