import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TransactionHistory from './TransactionHistory'

const currentUserEmail = 'usuario@mycodebank.cl'

const transferTransactions = [
  {
    id: 'old-sent',
    operationId: 'old-sent-operation',
    tipo: 'transferencia',
    emisorEmail: currentUserEmail,
    emisorNombre: 'Usuario Actual',
    receptorEmail: 'ana@mycodebank.cl',
    receptorNombre: 'Ana Perez',
    monto: 5000,
    descripcion: 'Transferencia antigua',
    fecha: new Date('2026-01-10T10:00:00'),
    estado: 'completado',
  },
  {
    id: 'new-received',
    operationId: 'new-received-operation',
    tipo: 'transferencia',
    emisorEmail: 'carlos@mycodebank.cl',
    emisorNombre: 'Carlos Diaz',
    receptorEmail: currentUserEmail,
    receptorNombre: 'Usuario Actual',
    monto: 12000,
    descripcion: 'Transferencia reciente',
    fecha: new Date('2026-03-20T10:00:00'),
    estado: 'completado',
  },
]

function renderHistory(props = {}) {
  return render(
    <TransactionHistory
      currentUserEmail={currentUserEmail}
      title="Historial completo"
      transactions={transferTransactions}
      {...props}
    />,
  )
}

describe('TransactionHistory', () => {
  it('muestra estado vacio cuando transactions esta vacio', () => {
    // Arrange
    renderHistory({ transactions: [] })

    // Act
    const emptyTitle = screen.getByText('Aun no tienes movimientos')
    const emptyDescription = screen.getByText('Tus movimientos apareceran aqui.')

    // Assert
    expect(emptyTitle).toBeInTheDocument()
    expect(emptyDescription).toBeInTheDocument()
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })

  it('renderiza movimientos recibidos por props', () => {
    // Arrange
    renderHistory()

    // Act
    const list = screen.getByRole('list', { name: /historial completo/i })

    // Assert
    expect(within(list).getByText('Carlos Diaz')).toBeInTheDocument()
    expect(within(list).getByText('Ana Perez')).toBeInTheDocument()
    expect(
      within(list).getByText('Transferencia reciente'),
    ).toBeInTheDocument()
    expect(
      within(list).getByText('Transferencia antigua'),
    ).toBeInTheDocument()
  })

  it('ordena movimientos del mas reciente al mas antiguo', () => {
    // Arrange
    renderHistory({ transactions: [...transferTransactions].reverse() })

    // Act
    const items = screen.getAllByRole('listitem')

    // Assert
    expect(within(items[0]).getByText('Transferencia reciente')).toBeInTheDocument()
    expect(within(items[1]).getByText('Transferencia antigua')).toBeInTheDocument()
  })

  it('distingue transferencia enviada y transferencia recibida para el usuario actual', () => {
    // Arrange
    renderHistory()

    // Act
    const items = screen.getAllByRole('listitem')

    // Assert
    expect(within(items[0]).getByText('Transferencia recibida')).toBeInTheDocument()
    expect(within(items[0]).getByText('Carlos Diaz')).toBeInTheDocument()
    expect(within(items[1]).getByText('Transferencia enviada')).toBeInTheDocument()
    expect(within(items[1]).getByText('Ana Perez')).toBeInTheDocument()
  })

  it('renderiza depositos y retiros simulados con su tipo correspondiente', () => {
    // Arrange
    const accountTransactions = [
      {
        id: 'deposit-1',
        operationId: 'deposit-operation',
        tipo: 'deposito',
        receptorEmail: currentUserEmail,
        monto: 30000,
        descripcion: 'Deposito inicial',
        fecha: new Date('2026-04-02T10:00:00'),
        estado: 'completado',
      },
      {
        id: 'withdrawal-1',
        operationId: 'withdrawal-operation',
        tipo: 'retiro',
        emisorEmail: currentUserEmail,
        monto: 10000,
        descripcion: 'Retiro de prueba',
        fecha: new Date('2026-04-01T10:00:00'),
        estado: 'completado',
      },
    ]

    renderHistory({ transactions: accountTransactions })

    // Act
    const items = screen.getAllByRole('listitem')

    // Assert
    expect(within(items[0]).getByText('Deposito simulado')).toBeInTheDocument()
    expect(within(items[0]).getByText('Deposito inicial')).toBeInTheDocument()
    expect(within(items[1]).getByText('Retiro simulado')).toBeInTheDocument()
    expect(within(items[1]).getByText('Retiro de prueba')).toBeInTheDocument()
  })
})
