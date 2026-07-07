import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { db } from './firebase'

const USERS_COLLECTION = 'users'
const DIRECTORY_COLLECTION = 'userDirectory'
const MOVEMENTS_COLLECTION = 'movimientos'
const DESCRIPTION_MAX_LENGTH = 120
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const TRANSFER_ERROR_MESSAGES = {
  UNAUTHENTICATED: 'Inicia sesion para realizar una transferencia.',
  INVALID_RECIPIENT: 'Ingresa un correo de destinatario valido.',
  INVALID_AMOUNT: 'Ingresa un monto valido en pesos completos.',
  INVALID_DESCRIPTION: 'La descripcion puede tener hasta 120 caracteres.',
  RECIPIENT_NOT_FOUND: 'No encontramos una cuenta XBank con ese correo.',
  SELF_TRANSFER: 'No puedes transferir dinero a tu propia cuenta.',
  SENDER_NOT_FOUND: 'No encontramos tu cuenta XBank.',
  RECIPIENT_ACCOUNT_NOT_FOUND: 'La cuenta destinataria ya no esta disponible.',
  INSUFFICIENT_FUNDS:
    'No tienes saldo suficiente para realizar esta transferencia.',
  INVALID_SENDER_BALANCE: 'No pudimos validar el saldo de tu cuenta.',
  INVALID_RECIPIENT_BALANCE:
    'No pudimos validar el saldo de la cuenta destinataria.',
  PERMISSION_DENIED: 'No tienes permisos para realizar esta operacion.',
  NETWORK_ERROR:
    'No fue posible completar la transferencia. Revisa tu conexion.',
  TRANSACTION_FAILED:
    'No fue posible completar la transferencia. Intenta nuevamente.',
}

export class TransferError extends Error {
  constructor(code) {
    super(TRANSFER_ERROR_MESSAGES[code] ?? TRANSFER_ERROR_MESSAGES.TRANSACTION_FAILED)
    this.name = 'TransferError'
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

export function normalizeEmail(value) {
  return getCleanString(value).toLowerCase()
}

export function isValidTransferEmail(value) {
  return emailPattern.test(normalizeEmail(value))
}

export function parseTransferAmount(value) {
  const rawAmount = getCleanString(value)

  if (!rawAmount || !/^\d+$/.test(rawAmount)) {
    throw new TransferError('INVALID_AMOUNT')
  }

  const amount = Number(rawAmount)

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new TransferError('INVALID_AMOUNT')
  }

  return amount
}

export function normalizeTransferDescription(value) {
  const description = getCleanString(value)

  if (description.length > DESCRIPTION_MAX_LENGTH) {
    throw new TransferError('INVALID_DESCRIPTION')
  }

  return description
}

function normalizeTransferError(error) {
  if (error instanceof TransferError) {
    return error
  }

  if (error?.code === 'permission-denied') {
    return new TransferError('PERMISSION_DENIED')
  }

  if (
    error?.code === 'unavailable' ||
    error?.code === 'deadline-exceeded' ||
    error?.code === 'cancelled'
  ) {
    return new TransferError('NETWORK_ERROR')
  }

  if (error?.code === 'app/firebase-not-configured') {
    return error
  }

  return new TransferError('TRANSACTION_FAILED')
}

export function getTransferErrorMessage(error) {
  if (error?.code === 'app/firebase-not-configured') {
    return 'Firebase no esta configurado. Revisa las variables reales en .env y reinicia Vite.'
  }

  return (
    TRANSFER_ERROR_MESSAGES[error?.code] ??
    TRANSFER_ERROR_MESSAGES.TRANSACTION_FAILED
  )
}

function mapDirectorySnapshot(snapshot) {
  const data = snapshot.data()
  const uid = getCleanString(data.uid) || snapshot.id
  const email = normalizeEmail(data.emailNormalizado)
  const name = getCleanString(data.nombre) || 'Usuario XBank'

  if (!uid || !email) {
    throw new TransferError('RECIPIENT_NOT_FOUND')
  }

  return {
    uid,
    name,
    email,
  }
}

export async function findRecipientByEmail(email) {
  ensureFirestoreReady()

  const normalizedEmail = normalizeEmail(email)

  if (!emailPattern.test(normalizedEmail)) {
    throw new TransferError('INVALID_RECIPIENT')
  }

  try {
    const recipientQuery = query(
      collection(db, DIRECTORY_COLLECTION),
      where('emailNormalizado', '==', normalizedEmail),
      limit(1),
    )
    const recipientSnapshot = await getDocs(recipientQuery)

    if (recipientSnapshot.empty) {
      throw new TransferError('RECIPIENT_NOT_FOUND')
    }

    return mapDirectorySnapshot(recipientSnapshot.docs[0])
  } catch (error) {
    throw normalizeTransferError(error)
  }
}

function mapUserAccount(snapshot, balanceErrorCode, missingErrorCode) {
  if (!snapshot.exists()) {
    throw new TransferError(missingErrorCode)
  }

  const data = snapshot.data()
  const balance = data.saldo

  if (
    typeof balance !== 'number' ||
    !Number.isFinite(balance) ||
    !Number.isInteger(balance)
  ) {
    throw new TransferError(balanceErrorCode)
  }

  return {
    uid: snapshot.id,
    name: getCleanString(data.nombre) || 'Usuario XBank',
    email: normalizeEmail(data.email),
    balance,
  }
}

export async function transferMoney({
  amount,
  description,
  recipientUid,
  senderUid,
}) {
  ensureFirestoreReady()

  if (!senderUid) {
    throw new TransferError('UNAUTHENTICATED')
  }

  if (!recipientUid) {
    throw new TransferError('RECIPIENT_NOT_FOUND')
  }

  if (senderUid === recipientUid) {
    throw new TransferError('SELF_TRANSFER')
  }

  const transferAmount = parseTransferAmount(String(amount))
  const transferDescription = normalizeTransferDescription(description)
  const senderRef = doc(db, USERS_COLLECTION, senderUid)
  const recipientRef = doc(db, USERS_COLLECTION, recipientUid)
  const movementRef = doc(collection(db, MOVEMENTS_COLLECTION))

  try {
    return await runTransaction(db, async (transaction) => {
      const senderSnapshot = await transaction.get(senderRef)
      const recipientSnapshot = await transaction.get(recipientRef)
      const senderAccount = mapUserAccount(
        senderSnapshot,
        'INVALID_SENDER_BALANCE',
        'SENDER_NOT_FOUND',
      )
      const recipientAccount = mapUserAccount(
        recipientSnapshot,
        'INVALID_RECIPIENT_BALANCE',
        'RECIPIENT_ACCOUNT_NOT_FOUND',
      )

      if (senderAccount.uid !== senderUid) {
        throw new TransferError('UNAUTHENTICATED')
      }

      if (senderAccount.uid === recipientAccount.uid) {
        throw new TransferError('SELF_TRANSFER')
      }

      if (senderAccount.balance < transferAmount) {
        throw new TransferError('INSUFFICIENT_FUNDS')
      }

      const newSenderBalance = senderAccount.balance - transferAmount
      const newRecipientBalance = recipientAccount.balance + transferAmount

      if (
        newSenderBalance < 0 ||
        !Number.isSafeInteger(newSenderBalance) ||
        !Number.isSafeInteger(newRecipientBalance)
      ) {
        throw new TransferError('TRANSACTION_FAILED')
      }

      const accountUpdate = {
        actualizadoEn: serverTimestamp(),
        ultimaTransferenciaId: movementRef.id,
      }

      transaction.update(senderRef, {
        ...accountUpdate,
        saldo: newSenderBalance,
      })
      transaction.update(recipientRef, {
        ...accountUpdate,
        saldo: newRecipientBalance,
      })

      const movementData = {
        operationId: movementRef.id,
        emisorUid: senderAccount.uid,
        receptorUid: recipientAccount.uid,
        emisorEmail: senderAccount.email,
        receptorEmail: recipientAccount.email,
        emisorNombre: senderAccount.name,
        receptorNombre: recipientAccount.name,
        monto: transferAmount,
        tipo: 'transferencia',
        estado: 'completado',
        fecha: serverTimestamp(),
      }

      if (transferDescription) {
        movementData.descripcion = transferDescription
      }

      transaction.set(movementRef, movementData)

      return {
        amount: transferAmount,
        createdAt: new Date(),
        description: transferDescription,
        movementId: movementRef.id,
        recipientEmail: recipientAccount.email,
        recipientName: recipientAccount.name,
      }
    })
  } catch (error) {
    throw normalizeTransferError(error)
  }
}
