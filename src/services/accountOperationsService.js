import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

const USERS_COLLECTION = 'users'
const MOVEMENTS_COLLECTION = 'movimientos'
const SIMULATED_COUNTERPARTY_UID = 'xbank-demo'
const SIMULATED_COUNTERPARTY_NAME = 'XBank Demo'
export const MAX_SIMULATED_OPERATION_AMOUNT = 1000000
export const OPERATION_DESCRIPTION_MAX_LENGTH = 120

const OPERATION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
}

const FIRESTORE_OPERATION_TYPES = {
  [OPERATION_TYPES.DEPOSIT]: 'deposito',
  [OPERATION_TYPES.WITHDRAWAL]: 'retiro',
}

const OPERATION_ERROR_MESSAGES = {
  UNAUTHENTICATED: 'Tu sesion expiro. Inicia sesion nuevamente.',
  ACCOUNT_NOT_FOUND: 'No encontramos la informacion de tu cuenta.',
  INVALID_AMOUNT: 'Ingresa un monto valido mayor a cero.',
  INVALID_DESCRIPTION: 'La descripcion puede tener hasta 120 caracteres.',
  AMOUNT_TOO_LARGE:
    'El monto supera el limite permitido para esta simulacion.',
  INSUFFICIENT_FUNDS: 'No tienes saldo suficiente para realizar este retiro.',
  BALANCE_CHANGED:
    'Tu saldo cambio antes de completar la operacion. Revisa el monto e intenta nuevamente.',
  INVALID_BALANCE: 'No pudimos interpretar el saldo actual de tu cuenta.',
  INVALID_OPERATION_TYPE: 'No pudimos reconocer esta operacion.',
  PERMISSION_DENIED: 'No tienes permisos para realizar esta operacion.',
  NETWORK_ERROR: 'No fue posible conectarse. Revisa tu conexion.',
  TRANSACTION_FAILED: 'No pudimos completar la operacion.',
}

export class AccountOperationError extends Error {
  constructor(code) {
    super(
      OPERATION_ERROR_MESSAGES[code] ??
        OPERATION_ERROR_MESSAGES.TRANSACTION_FAILED,
    )
    this.name = 'AccountOperationError'
    this.code = code
  }
}

function ensureFirestoreReady() {
  if (!db) {
    throw { code: 'app/firebase-not-configured' }
  }
}

function getCleanString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeOperationError(error) {
  if (error instanceof AccountOperationError) {
    return error
  }

  if (error?.code === 'permission-denied') {
    return new AccountOperationError('PERMISSION_DENIED')
  }

  if (
    error?.code === 'unavailable' ||
    error?.code === 'deadline-exceeded' ||
    error?.code === 'cancelled'
  ) {
    return new AccountOperationError('NETWORK_ERROR')
  }

  if (error?.code === 'app/firebase-not-configured') {
    return error
  }

  return new AccountOperationError('TRANSACTION_FAILED')
}

export function getAccountOperationErrorMessage(error) {
  if (error?.code === 'app/firebase-not-configured') {
    return 'Firebase no esta configurado. Revisa las variables reales en .env y reinicia Vite.'
  }

  return (
    OPERATION_ERROR_MESSAGES[error?.code] ??
    OPERATION_ERROR_MESSAGES.TRANSACTION_FAILED
  )
}

export function parseAccountOperationAmount(value) {
  const rawAmount = getCleanString(value)

  if (!rawAmount || !/^\d+$/.test(rawAmount)) {
    throw new AccountOperationError('INVALID_AMOUNT')
  }

  const amount = Number(rawAmount)

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new AccountOperationError('INVALID_AMOUNT')
  }

  if (amount > MAX_SIMULATED_OPERATION_AMOUNT) {
    throw new AccountOperationError('AMOUNT_TOO_LARGE')
  }

  return amount
}

export function normalizeAccountOperationDescription(value) {
  const description = getCleanString(value)

  if (description.length > OPERATION_DESCRIPTION_MAX_LENGTH) {
    throw new AccountOperationError('INVALID_DESCRIPTION')
  }

  return description
}

function mapUserAccount(snapshot) {
  if (!snapshot.exists()) {
    throw new AccountOperationError('ACCOUNT_NOT_FOUND')
  }

  const data = snapshot.data()
  const balance = data.saldo

  if (
    typeof balance !== 'number' ||
    !Number.isFinite(balance) ||
    !Number.isInteger(balance)
  ) {
    throw new AccountOperationError('INVALID_BALANCE')
  }

  return {
    uid: snapshot.id,
    name: getCleanString(data.nombre) || 'Usuario XBank',
    email: getCleanString(data.email).toLowerCase(),
    balance,
  }
}

function getOperationConfig(type) {
  if (type === OPERATION_TYPES.DEPOSIT) {
    return {
      direction: 'deposit',
      firestoreType: FIRESTORE_OPERATION_TYPES.deposit,
      getNextBalance: (currentBalance, amount) => currentBalance + amount,
      getMovementData: ({ account, amount, description, movementId }) => ({
        operationId: movementId,
        emisorUid: SIMULATED_COUNTERPARTY_UID,
        receptorUid: account.uid,
        emisorNombre: SIMULATED_COUNTERPARTY_NAME,
        receptorNombre: account.name,
        receptorEmail: account.email,
        monto: amount,
        tipo: FIRESTORE_OPERATION_TYPES.deposit,
        estado: 'completado',
        fecha: serverTimestamp(),
        ...(description ? { descripcion: description } : {}),
      }),
    }
  }

  if (type === OPERATION_TYPES.WITHDRAWAL) {
    return {
      direction: 'withdrawal',
      firestoreType: FIRESTORE_OPERATION_TYPES.withdrawal,
      getNextBalance: (currentBalance, amount) => currentBalance - amount,
      getMovementData: ({ account, amount, description, movementId }) => ({
        operationId: movementId,
        emisorUid: account.uid,
        receptorUid: SIMULATED_COUNTERPARTY_UID,
        emisorNombre: account.name,
        receptorNombre: SIMULATED_COUNTERPARTY_NAME,
        emisorEmail: account.email,
        monto: amount,
        tipo: FIRESTORE_OPERATION_TYPES.withdrawal,
        estado: 'completado',
        fecha: serverTimestamp(),
        ...(description ? { descripcion: description } : {}),
      }),
    }
  }

  throw new AccountOperationError('INVALID_OPERATION_TYPE')
}

async function executeAccountOperation({
  amount,
  description,
  expectedBalance,
  type,
  userUid,
}) {
  ensureFirestoreReady()

  if (!userUid) {
    throw new AccountOperationError('UNAUTHENTICATED')
  }

  const operationAmount = parseAccountOperationAmount(String(amount))
  const operationDescription = normalizeAccountOperationDescription(description)
  const operationConfig = getOperationConfig(type)
  const userRef = doc(db, USERS_COLLECTION, userUid)
  const movementRef = doc(collection(db, MOVEMENTS_COLLECTION))

  try {
    return await runTransaction(db, async (transaction) => {
      const userSnapshot = await transaction.get(userRef)
      const account = mapUserAccount(userSnapshot)

      if (account.uid !== userUid) {
        throw new AccountOperationError('UNAUTHENTICATED')
      }

      if (
        operationConfig.direction === OPERATION_TYPES.WITHDRAWAL &&
        Number.isSafeInteger(expectedBalance) &&
        account.balance !== expectedBalance
      ) {
        throw new AccountOperationError('BALANCE_CHANGED')
      }

      if (
        operationConfig.direction === OPERATION_TYPES.WITHDRAWAL &&
        account.balance < operationAmount
      ) {
        throw new AccountOperationError('INSUFFICIENT_FUNDS')
      }

      const nextBalance = operationConfig.getNextBalance(
        account.balance,
        operationAmount,
      )

      if (
        nextBalance < 0 ||
        !Number.isSafeInteger(nextBalance)
      ) {
        throw new AccountOperationError('INVALID_BALANCE')
      }

      transaction.update(userRef, {
        actualizadoEn: serverTimestamp(),
        saldo: nextBalance,
        ultimaTransferenciaId: movementRef.id,
      })
      transaction.set(
        movementRef,
        operationConfig.getMovementData({
          account,
          amount: operationAmount,
          description: operationDescription,
          movementId: movementRef.id,
        }),
      )

      return {
        amount: operationAmount,
        createdAt: new Date(),
        description: operationDescription,
        movementId: movementRef.id,
        newBalance: nextBalance,
        previousBalance: account.balance,
        type,
      }
    })
  } catch (error) {
    throw normalizeOperationError(error)
  }
}

export function depositMoney({ amount, description, userUid }) {
  return executeAccountOperation({
    amount,
    description,
    type: OPERATION_TYPES.DEPOSIT,
    userUid,
  })
}

export function withdrawMoney({ amount, description, expectedBalance, userUid }) {
  return executeAccountOperation({
    amount,
    description,
    expectedBalance,
    type: OPERATION_TYPES.WITHDRAWAL,
    userUid,
  })
}
