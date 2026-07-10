export const AUTH_MODES = {
  LOGIN: 'login',
  REGISTER: 'register',
}

export const AUTH_PATHS = {
  [AUTH_MODES.LOGIN]: '/login',
  [AUTH_MODES.REGISTER]: '/register',
}

export function getCurrentInternalPath() {
  if (typeof window === 'undefined') {
    return '/'
  }

  const hashPath = window.location.hash.replace(/^#/, '')

  if (!hashPath) {
    return '/'
  }

  return hashPath.startsWith('/') ? hashPath : `/${hashPath}`
}

export function getAuthModeFromPath(pathname) {
  return pathname === AUTH_PATHS[AUTH_MODES.REGISTER]
    ? AUTH_MODES.REGISTER
    : AUTH_MODES.LOGIN
}

export function isPublicAuthPath(pathname) {
  return (
    pathname === '/' ||
    pathname === AUTH_PATHS[AUTH_MODES.LOGIN] ||
    pathname === AUTH_PATHS[AUTH_MODES.REGISTER]
  )
}

export function navigateToPath(path, { replace = false } = {}) {
  if (typeof window === 'undefined') {
    return
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const nextHash = `#${cleanPath}`

  if (window.location.hash === nextHash) {
    return
  }

  if (replace) {
    window.location.replace(nextHash)
    return
  }

  window.location.hash = cleanPath
}
