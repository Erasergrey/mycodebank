const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const mensajesValidacionTransferencia = {
  montoRequerido: 'Ingresa el monto a transferir.',
  montoInvalido: 'Ingresa un monto valido en pesos completos.',
  montoMayorACero: 'El monto debe ser mayor a cero.',
  saldoInsuficiente:
    'No tienes saldo suficiente para realizar esta transferencia.',
  saldoInvalido: 'No pudimos validar tu saldo disponible.',
  destinatarioRequerido: 'Ingresa el correo del destinatario.',
  emailInvalido: 'Ingresa un correo valido.',
  transferenciaPropia: 'No puedes transferir dinero a tu propia cuenta.',
}

function limpiarTexto(value) {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value).trim()
}

export function normalizarEmail(value) {
  return limpiarTexto(value).toLowerCase()
}

export function esEmailValido(value) {
  return emailPattern.test(normalizarEmail(value))
}

export function validarTransferencia({
  monto,
  saldoDisponible,
  emailDestino,
  emailUsuarioActual,
}) {
  const errores = {}
  const montoNormalizado = limpiarTexto(monto)
  const saldo = Number(saldoDisponible)
  const emailDestinoNormalizado = normalizarEmail(emailDestino)
  const emailUsuarioActualNormalizado = normalizarEmail(emailUsuarioActual)

  if (!montoNormalizado) {
    errores.monto = mensajesValidacionTransferencia.montoRequerido
  } else {
    const montoNumerico = Number(montoNormalizado)

    if (!Number.isFinite(montoNumerico)) {
      errores.monto = mensajesValidacionTransferencia.montoInvalido
    } else if (montoNumerico <= 0) {
      errores.monto = mensajesValidacionTransferencia.montoMayorACero
    } else if (
      !/^\d+$/.test(montoNormalizado) ||
      !Number.isSafeInteger(montoNumerico)
    ) {
      errores.monto = mensajesValidacionTransferencia.montoInvalido
    } else if (!Number.isFinite(saldo) || !Number.isInteger(saldo)) {
      errores.saldoDisponible = mensajesValidacionTransferencia.saldoInvalido
    } else if (montoNumerico > saldo) {
      errores.monto = mensajesValidacionTransferencia.saldoInsuficiente
    }
  }

  if (!emailDestinoNormalizado) {
    errores.emailDestino = mensajesValidacionTransferencia.destinatarioRequerido
  } else if (!esEmailValido(emailDestinoNormalizado)) {
    errores.emailDestino = mensajesValidacionTransferencia.emailInvalido
  } else if (
    emailUsuarioActualNormalizado &&
    emailDestinoNormalizado === emailUsuarioActualNormalizado
  ) {
    errores.emailDestino = mensajesValidacionTransferencia.transferenciaPropia
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores,
  }
}
