export const AUTH_MODES = {
  LOGIN: 'login',
  REGISTER: 'register',
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
  if (typeof window === 'undefined' || window.location.pathname === path) {
    return
  }

  if (replace) {
    window.history.replaceState(null, '', path)
    return
  }

  window.history.pushState(null, '', path)
}
