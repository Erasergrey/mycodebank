import {
  collection,
  onSnapshot,
  or,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { db } from './firebaseDb'

const TRANSACTIONS_COLLECTION = 'movimientos'
const VALID_TRANSACTION_TYPES = new Set(['transferencia', 'deposito', 'retiro'])
const VALID_TRANSACTION_STATUSES = new Map([
  ['completado', 'completed'],
  ['pendiente', 'pending'],
  ['fallido', 'failed'],
  ['completed', 'completed'],
  ['pending', 'pending'],
  ['failed', 'failed'],
])

function ensureFirestoreReady() {
  if (!db) {
    throw { code: 'app/firebase-not-configured' }
  }
}

function getCleanString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function getOptionalString(value) {
  const cleanValue = getCleanString(value)

  return cleanValue || null
}

function getSafeDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value
  }

  if (value?.toDate) {
    const date = value.toDate()

    return Number.isNaN(date.getTime()) ? null : date
  }

  return null
}

function getShortIdentifier(value) {
  const cleanValue = getCleanString(value)

  if (!cleanValue) {
    return ''
  }

  if (cleanValue.length <= 12) {
    return cleanValue
  }

  return `${cleanValue.slice(0, 6)}...${cleanValue.slice(-4)}`
}

function getMovementType(data) {
  const rawType = getCleanString(data.tipo)

  if (!rawType) {
    return 'transferencia'
  }

  return VALID_TRANSACTION_TYPES.has(rawType) ? rawType : null
}

function getMovementStatus(data) {
  const rawStatus = getCleanString(data.estado)

  if (!rawStatus) {
    return null
  }

  return VALID_TRANSACTION_STATUSES.get(rawStatus) ?? null
}

function getDirection({ senderUid, receiverUid, type, uid }) {
  if (type === 'deposito') {
    return receiverUid === uid ? 'deposit' : null
  }

  if (type === 'retiro') {
    return senderUid === uid ? 'withdrawal' : null
  }

  if (senderUid === uid) {
    return 'sent'
  }

  if (receiverUid === uid) {
    return 'received'
  }

  return null
}

function getCounterparty({ data, direction, receiverUid, senderUid }) {
  if (direction === 'sent') {
    const name =
      getOptionalString(data.receptorNombre) ||
      getOptionalString(data.receptorEmail) ||
      getShortIdentifier(receiverUid) ||
      'Usuario XBank'

    return {
      name,
      email: getOptionalString(data.receptorEmail),
      identifier: getShortIdentifier(receiverUid),
    }
  }

  if (direction === 'received') {
    const name =
      getOptionalString(data.emisorNombre) ||
      getOptionalString(data.emisorEmail) ||
      getShortIdentifier(senderUid) ||
      'Usuario XBank'

    return {
      name,
      email: getOptionalString(data.emisorEmail),
      identifier: getShortIdentifier(senderUid),
    }
  }

  if (direction === 'deposit') {
    return {
      name: 'XBank Demo',
      email: null,
      identifier: '',
    }
  }

  return {
    name: 'XBank Demo',
    email: null,
    identifier: '',
  }
}

function warnInvalidTransaction(id, reason) {
  if (import.meta.env.DEV) {
    console.warn('Invalid transaction ignored:', { id, reason })
  }
}

function mapTransactionDocument(snapshot, uid) {
  const data = snapshot.data()
  const senderUid = getOptionalString(data.emisorUid)
  const receiverUid = getOptionalString(data.receptorUid)
  const amount = data.monto
  const type = getMovementType(data)
  const status = getMovementStatus(data)

  if (!snapshot.id) {
    warnInvalidTransaction(snapshot.id, 'missing-id')
    return null
  }

  if (!type) {
    warnInvalidTransaction(snapshot.id, 'invalid-type')
    return null
  }

  if (type === 'transferencia' && (!senderUid || !receiverUid)) {
    warnInvalidTransaction(snapshot.id, 'missing-transfer-participants')
    return null
  }

  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    warnInvalidTransaction(snapshot.id, 'invalid-amount')
    return null
  }

  const direction = getDirection({ senderUid, receiverUid, type, uid })

  if (!direction) {
    warnInvalidTransaction(snapshot.id, 'not-current-user-transaction')
    return null
  }

  const counterparty = getCounterparty({
    data,
    direction,
    receiverUid,
    senderUid,
  })

  return {
    id: snapshot.id,
    operationId: getOptionalString(data.operationId) || snapshot.id,
    senderUid,
    receiverUid,
    counterpartyName: counterparty.name,
    counterpartyEmail: counterparty.email,
    counterpartyIdentifier: counterparty.identifier,
    amount,
    description: getOptionalString(data.descripcion),
    date: getSafeDate(data.fecha),
    direction,
    type,
    status,
  }
}

function sortTransactionsByDateDesc(firstTransaction, secondTransaction) {
  const firstTime = firstTransaction.date?.getTime() ?? Number.NEGATIVE_INFINITY
  const secondTime = secondTransaction.date?.getTime() ?? Number.NEGATIVE_INFINITY

  if (firstTime !== secondTime) {
    return secondTime - firstTime
  }

  return firstTransaction.id.localeCompare(secondTransaction.id)
}

function getUniqueTransactions(transactions) {
  return Array.from(
    transactions.reduce((transactionMap, transaction) => {
      transactionMap.set(transaction.id, transaction)
      return transactionMap
    }, new Map()).values(),
  )
}

export function subscribeToUserTransactions({ uid, onData, onError }) {
  ensureFirestoreReady()

  if (!uid) {
    throw { code: 'app/missing-user-id' }
  }

  const transactionsRef = collection(db, TRANSACTIONS_COLLECTION)
  const transactionsQuery = query(
    transactionsRef,
    or(where('emisorUid', '==', uid), where('receptorUid', '==', uid)),
    orderBy('fecha', 'desc'),
  )

  return onSnapshot(
    transactionsQuery,
    (snapshot) => {
      const transactions = getUniqueTransactions(
        snapshot.docs
          .map((documentSnapshot) => mapTransactionDocument(documentSnapshot, uid))
          .filter(Boolean),
      ).sort(sortTransactionsByDateDesc)

      onData({
        transactions,
        fromCache: snapshot.metadata.fromCache,
      })
    },
    onError,
  )
}
