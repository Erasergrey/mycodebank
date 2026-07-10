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

export function toInternalPath(pathname) {
  if (!APP_BASE_PATH) {
    return pathname || '/'
  }

  if (pathname === APP_BASE_PATH) {
    return '/'
  }

  if (pathname.startsWith(`${APP_BASE_PATH}/`)) {
    return pathname.slice(APP_BASE_PATH.length) || '/'
  }

  return pathname || '/'
}

export function toPublicPath(internalPath) {
  const cleanPath = internalPath.startsWith('/') ? internalPath : `/${internalPath}`

  return `${APP_BASE_PATH}${cleanPath}` || '/'
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

  if (typeof window === 'undefined' || window.location.pathname === publicPath) {
    return
  }

  if (replace) {
    window.history.replaceState(null, '', publicPath)
    return
  }

  window.history.pushState(null, '', publicPath)
}
