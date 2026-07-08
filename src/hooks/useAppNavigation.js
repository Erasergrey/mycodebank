import { useEffect, useState } from 'react'
import {
  AUTH_MODES,
  AUTH_PATHS,
  getAuthModeFromPath,
  isPublicAuthPath,
  navigateToPath,
} from '../config/auth'
import {
  DEFAULT_SECTION,
  getNavigationItem,
  getNavigationItemByPath,
  getSectionFromPath,
} from '../config/navigation'

function getInitialSection() {
  if (typeof window === 'undefined') {
    return DEFAULT_SECTION
  }

  return getSectionFromPath(window.location.pathname)
}

function getInitialAuthMode() {
  if (typeof window === 'undefined') {
    return AUTH_MODES.LOGIN
  }

  return getAuthModeFromPath(window.location.pathname)
}

function resolvePathState({ currentUser, setActiveSection, setAuthMode }) {
  const currentPath = window.location.pathname

  if (currentUser) {
    const privateItem = getNavigationItemByPath(currentPath)

    if (privateItem) {
      setActiveSection(privateItem.id)
      return
    }

    setActiveSection(DEFAULT_SECTION)
    navigateToPath('/dashboard', { replace: true })
    return
  }

  if (isPublicAuthPath(currentPath)) {
    setAuthMode(getAuthModeFromPath(currentPath))
    return
  }

  setAuthMode(AUTH_MODES.LOGIN)
  navigateToPath(AUTH_PATHS[AUTH_MODES.LOGIN], { replace: true })
}

function useAppNavigation({ authLoading, currentUser }) {
  const [authMode, setAuthMode] = useState(getInitialAuthMode)
  const [activeSection, setActiveSection] = useState(getInitialSection)

  useEffect(() => {
    if (authLoading || typeof window === 'undefined') {
      return
    }

    resolvePathState({ currentUser, setActiveSection, setAuthMode })
  }, [authLoading, currentUser])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    function handlePopState() {
      if (authLoading) {
        return
      }

      resolvePathState({ currentUser, setActiveSection, setAuthMode })
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [authLoading, currentUser])

  function showLogin() {
    setAuthMode(AUTH_MODES.LOGIN)
    navigateToPath(AUTH_PATHS[AUTH_MODES.LOGIN])
  }

  function showRegister() {
    setAuthMode(AUTH_MODES.REGISTER)
    navigateToPath(AUTH_PATHS[AUTH_MODES.REGISTER])
  }

  function navigateSection(sectionId) {
    const item = getNavigationItem(sectionId)

    if (!item || item.disabled) {
      return false
    }

    setActiveSection(item.id)
    navigateToPath(item.path)

    return true
  }

  function resetToLogin() {
    setActiveSection(DEFAULT_SECTION)
    setAuthMode(AUTH_MODES.LOGIN)
    navigateToPath(AUTH_PATHS[AUTH_MODES.LOGIN], { replace: true })
  }

  return {
    activeSection,
    authMode,
    navigateSection,
    resetToLogin,
    showLogin,
    showRegister,
  }
}

export default useAppNavigation
