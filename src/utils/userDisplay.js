export function getDisplayName({ currentUser, profile }) {
  return (
    profile?.nombre?.trim() ||
    currentUser?.displayName?.trim() ||
    'Usuario'
  )
}

export function getDisplayEmail({ currentUser, profile }) {
  return profile?.email ?? currentUser?.email ?? 'Cuenta XBank'
}

export function getInitials(value) {
  if (!value?.trim()) {
    return 'U'
  }

  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export function getAccountIdentifier(uid) {
  if (!uid) {
    return 'Cuenta XBank'
  }

  return `**** ${uid.slice(-4).toUpperCase()}`
}
