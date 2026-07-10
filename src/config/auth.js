export const AUTH_MODES = {
  LOGIN: 'login',
  REGISTER: 'register',
}

const BASE_PATH = import.meta.env.BASE_URL ?? '/'

function normalizeBasePath(basePath) {
  if (!basePath || basePath === '/') {
    return ''
  }

  return basePath.endsWith('/') ? basePath.slice(0, -1) : basePath
}

export const APP_BASE_PATH = normalizeBasePath(BASE_PATH)

export function toInternalPath(hash) {
  const cleanHash = hash?.startsWith('#') ? hash.slice(1) : hash

  if (!cleanHash) {
    return '/'
  }

  return cleanHash.startsWith('/') ? cleanHash : `/${cleanHash}`
}

export function getCurrentInternalPath() {
  if (typeof window === 'undefined') {
    return '/'
  }

  return toInternalPath(window.location.hash)
}

export function toPublicPath(internalPath) {
  const path = internalPath || '/'
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  return `${APP_BASE_PATH}/#${cleanPath}`
}

export const AUTH_PATHS = {
  [AUTH_MODES.LOGIN]: '/login',
  [AUTH_MODES.REGISTER]: '/register',
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
  const publicPath = toPublicPath(path)

  if (typeof window === 'undefined') {
    return
  }

  const currentPublicPath = `${window.location.pathname}${window.location.hash}`

  if (currentPublicPath === publicPath) {
    return
  }

  if (replace) {
    window.history.replaceState(null, '', publicPath)
    return
  }

  window.history.pushState(null, '', publicPath)
}
