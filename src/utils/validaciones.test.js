import { describe, expect, it } from 'vitest'
import {
  mensajesValidacionTransferencia,
  validarTransferencia,
} from './validaciones'

const transferenciaValida = {
  monto: '10000',
  saldoDisponible: 50000,
  emailDestino: 'destino@mycodebank.cl',
  emailUsuarioActual: 'usuario@mycodebank.cl',
}

describe('validarTransferencia', () => {
  it('rechaza monto vacio', () => {
    // Arrange
    const datosTransferencia = {
      ...transferenciaValida,
      monto: '',
    }

    // Act
    const resultado = validarTransferencia(datosTransferencia)

    // Assert
    expect(resultado).toEqual({
      valido: false,
      errores: {
        monto: mensajesValidacionTransferencia.montoRequerido,
      },
    })
  })

  it('rechaza monto nulo como monto vacio', () => {
    // Arrange
    const datosTransferencia = {
      ...transferenciaValida,
      monto: null,
    }

    // Act
    const resultado = validarTransferencia(datosTransferencia)

    // Assert
    expect(resultado.valido).toBe(false)
    expect(resultado.errores.monto).toBe(
      mensajesValidacionTransferencia.montoRequerido,
    )
  })

  it.each([
    ['monto negativo', '-1000', mensajesValidacionTransferencia.montoMayorACero],
    ['monto cero', '0', mensajesValidacionTransferencia.montoMayorACero],
    ['monto no numerico', 'abc', mensajesValidacionTransferencia.montoInvalido],
    [
      'monto con decimales invalidos',
      '1000.50',
      mensajesValidacionTransferencia.montoInvalido,
    ],
  ])('rechaza %s', (_caso, monto, mensajeEsperado) => {
    // Arrange
    const datosTransferencia = {
      ...transferenciaValida,
      monto,
    }

    // Act
    const resultado = validarTransferencia(datosTransferencia)

    // Assert
    expect(resultado.valido).toBe(false)
    expect(resultado.errores.monto).toBe(mensajeEsperado)
  })

  it('rechaza monto mayor al saldo disponible', () => {
    // Arrange
    const datosTransferencia = {
      ...transferenciaValida,
      monto: '60000',
      saldoDisponible: 50000,
    }

    // Act
    const resultado = validarTransferencia(datosTransferencia)

    // Assert
    expect(resultado.valido).toBe(false)
    expect(resultado.errores.monto).toBe(
      mensajesValidacionTransferencia.saldoInsuficiente,
    )
  })

  it('rechaza saldo disponible invalido', () => {
    // Arrange
    const datosTransferencia = {
      ...transferenciaValida,
      saldoDisponible: 'saldo',
    }

    // Act
    const resultado = validarTransferencia(datosTransferencia)

    // Assert
    expect(resultado.valido).toBe(false)
    expect(resultado.errores.saldoDisponible).toBe(
      mensajesValidacionTransferencia.saldoInvalido,
    )
  })

  it('rechaza transferencia a uno mismo', () => {
    // Arrange
    const datosTransferencia = {
      ...transferenciaValida,
      emailDestino: 'USUARIO@mycodebank.cl',
      emailUsuarioActual: 'usuario@mycodebank.cl',
    }

    // Act
    const resultado = validarTransferencia(datosTransferencia)

    // Assert
    expect(resultado.valido).toBe(false)
    expect(resultado.errores.emailDestino).toBe(
      mensajesValidacionTransferencia.transferenciaPropia,
    )
  })

  it('rechaza destinatario vacio', () => {
    // Arrange
    const datosTransferencia = {
      ...transferenciaValida,
      emailDestino: '',
    }

    // Act
    const resultado = validarTransferencia(datosTransferencia)

    // Assert
    expect(resultado.valido).toBe(false)
    expect(resultado.errores.emailDestino).toBe(
      mensajesValidacionTransferencia.destinatarioRequerido,
    )
  })

  it('rechaza email invalido', () => {
    // Arrange
    const datosTransferencia = {
      ...transferenciaValida,
      emailDestino: 'correo-invalido',
    }

    // Act
    const resultado = validarTransferencia(datosTransferencia)

    // Assert
    expect(resultado.valido).toBe(false)
    expect(resultado.errores.emailDestino).toBe(
      mensajesValidacionTransferencia.emailInvalido,
    )
  })

  it('acepta transferencia valida', () => {
    // Arrange
    const datosTransferencia = transferenciaValida

    // Act
    const resultado = validarTransferencia(datosTransferencia)

    // Assert
    expect(resultado).toEqual({
      valido: true,
      errores: {},
    })
  })
})
