export function formatCurrency(value) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatProfileDate(value) {
  if (!value?.toDate) {
    return 'No disponible'
  }

  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(value.toDate())
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

export function formatTransactionDate(value) {
  const date = getSafeDate(value)

  if (!date) {
    return 'Fecha en proceso'
  }

  const now = new Date()
  const currentDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime()
  const transactionDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime()
  const dayDifference = Math.round(
    (currentDay - transactionDay) / 86_400_000,
  )
  const time = new Intl.DateTimeFormat('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)

  if (dayDifference === 0) {
    return `Hoy, ${time}`
  }

  if (dayDifference === 1) {
    return `Ayer, ${time}`
  }

  const calendarDate = new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)

  return `${calendarDate}, ${time}`
}
