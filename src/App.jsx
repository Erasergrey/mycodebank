import { useEffect, useState } from 'react'
import LoginForm from './components/auth/LoginForm'
import RegisterForm from './components/auth/RegisterForm'
import AppLayout from './components/layout/AppLayout'
import {
  APP_SECTIONS,
  DEFAULT_SECTION,
  getNavigationItem,
  getNavigationItemByPath,
  getSectionFromPath,
} from './config/navigation'
import DashboardPage from './pages/DashboardPage'
import DepositPage from './pages/DepositPage'
import HelpPage from './pages/HelpPage'
import SettingsPage from './pages/SettingsPage'
import TransactionsPage from './pages/TransactionsPage'
import TransferPage from './pages/TransferPage'
import WithdrawPage from './pages/WithdrawPage'
import useRealtimeTransactions from './hooks/useRealtimeTransactions'
import useUserProfile from './hooks/useUserProfile'
import { logoutUser, subscribeToAuthState } from './services/authService'
import { getFirebaseErrorMessage } from './services/firebaseErrors'
import './styles/auth.css'
import './styles/dashboard.css'
import './styles/layout.css'

const AUTH_MODES = {
  LOGIN: 'login',
  REGISTER: 'register',
}

const AUTH_PATHS = {
  [AUTH_MODES.LOGIN]: '/login',
  [AUTH_MODES.REGISTER]: '/register',
}

function getAuthModeFromPath(pathname) {
  return pathname === AUTH_PATHS[AUTH_MODES.REGISTER]
    ? AUTH_MODES.REGISTER
    : AUTH_MODES.LOGIN
}

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

function isPublicAuthPath(pathname) {
  return (
    pathname === '/' ||
    pathname === AUTH_PATHS[AUTH_MODES.LOGIN] ||
    pathname === AUTH_PATHS[AUTH_MODES.REGISTER]
  )
}

function navigateToPath(path, { replace = false } = {}) {
  if (typeof window === 'undefined' || window.location.pathname === path) {
    return
  }

  if (replace) {
    window.history.replaceState(null, '', path)
    return
  }

  window.history.pushState(null, '', path)
}

function App() {
  const [authMode, setAuthMode] = useState(getInitialAuthMode)
  const [activeSection, setActiveSection] = useState(getInitialSection)
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [authOperationInProgress, setAuthOperationInProgress] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const {
    profile,
    isLoading: profileLoading,
    error: profileError,
    isRealtime: profileRealtime,
    reloadProfile,
  } = useUserProfile(currentUser?.uid)
  const {
    transactions,
    isLoading: transactionsLoading,
    error: transactionsError,
    retryTransactions,
  } = useRealtimeTransactions(currentUser?.uid)

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(
      (user) => {
        setCurrentUser(user)
        setAuthError('')
        setLogoutError('')
        setAuthLoading(false)
      },
      (error) => {
        setAuthError(getFirebaseErrorMessage(error))
        setAuthLoading(false)
      },
    )

    return unsubscribe
  }, [])

  useEffect(() => {
    if (authLoading || typeof window === 'undefined') {
      return
    }

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
  }, [authLoading, currentUser])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    function handlePopState() {
      if (authLoading) {
        return
      }

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

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [authLoading, currentUser])

  function handleShowLogin() {
    setAuthMode(AUTH_MODES.LOGIN)
    setAuthError('')
    navigateToPath(AUTH_PATHS[AUTH_MODES.LOGIN])
  }

  function handleShowRegister() {
    setAuthMode(AUTH_MODES.REGISTER)
    setAuthError('')
    navigateToPath(AUTH_PATHS[AUTH_MODES.REGISTER])
  }

  function handleAuthOperationStart() {
    setAuthError('')
    setAuthOperationInProgress(true)
  }

  function handleAuthOperationEnd() {
    setAuthOperationInProgress(false)
  }

  async function handleLogout() {
    if (logoutLoading) {
      return
    }

    setLogoutError('')
    setLogoutLoading(true)

    try {
      await logoutUser()
      setActiveSection(DEFAULT_SECTION)

      navigateToPath(AUTH_PATHS[AUTH_MODES.LOGIN], { replace: true })
    } catch (error) {
      setLogoutError(getFirebaseErrorMessage(error))
    } finally {
      setLogoutLoading(false)
    }
  }

  function handleNavigate(sectionId) {
    const item = getNavigationItem(sectionId)

    if (!item || item.disabled) {
      return
    }

    setActiveSection(item.id)
    setLogoutError('')

    navigateToPath(item.path)
  }

  function renderAuthenticatedPage() {
    const dashboardProps = {
      currentUser,
      logoutLoading,
      onLogout: handleLogout,
      onNavigate: handleNavigate,
      profile,
      profileError,
      profileLoading,
      profileRealtime,
      reloadProfile,
      retryTransactions,
      transactions,
      transactionsError,
      transactionsLoading,
    }

    switch (activeSection) {
      case APP_SECTIONS.TRANSFER:
        return (
          <TransferPage
            currentUser={currentUser}
            onGoDashboard={() => handleNavigate(APP_SECTIONS.DASHBOARD)}
            onViewTransactions={() => handleNavigate(APP_SECTIONS.TRANSACTIONS)}
            profile={profile}
            profileLoading={profileLoading}
          />
        )
      case APP_SECTIONS.TRANSACTIONS:
        return (
          <TransactionsPage
            onRetryTransactions={retryTransactions}
            onTransfer={() => handleNavigate(APP_SECTIONS.TRANSFER)}
            transactions={transactions}
            transactionsError={transactionsError}
            transactionsLoading={transactionsLoading}
          />
        )
      case APP_SECTIONS.DEPOSIT:
        return (
          <DepositPage
            currentUser={currentUser}
            onGoDashboard={() => handleNavigate(APP_SECTIONS.DASHBOARD)}
            onViewTransactions={() => handleNavigate(APP_SECTIONS.TRANSACTIONS)}
            profile={profile}
            profileLoading={profileLoading}
          />
        )
      case APP_SECTIONS.WITHDRAW:
        return (
          <WithdrawPage
            currentUser={currentUser}
            onGoDashboard={() => handleNavigate(APP_SECTIONS.DASHBOARD)}
            onViewTransactions={() => handleNavigate(APP_SECTIONS.TRANSACTIONS)}
            profile={profile}
            profileLoading={profileLoading}
          />
        )
      case APP_SECTIONS.SETTINGS:
        return <SettingsPage />
      case APP_SECTIONS.HELP:
        return <HelpPage />
      case APP_SECTIONS.DASHBOARD:
      default:
        return <DashboardPage {...dashboardProps} />
    }
  }

  if (authLoading) {
    return (
      <main className="auth-shell">
        <section className="ui-card loading-panel" aria-live="polite">
          <p>Comprobando sesion...</p>
        </section>
      </main>
    )
  }

  if (currentUser && !authOperationInProgress) {
    return (
      <AppLayout
        activeSection={activeSection}
        currentUser={currentUser}
        logoutError={logoutError}
        logoutLoading={logoutLoading}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        profile={profile}
        profileError={profileError}
        profileLoading={profileLoading}
      >
        {renderAuthenticatedPage()}
      </AppLayout>
    )
  }

  return (
    <main className="auth-shell">
      <section className="ui-card auth-card" aria-labelledby="auth-title">
        <header className="auth-header">
          <p className="eyebrow">React + Firebase</p>
          <h1 id="auth-title">MYCODEBANK</h1>
          <p>Acceso inicial para probar registro e inicio de sesion.</p>
        </header>

        <div className="mode-switch" aria-label="Cambiar modo de acceso">
          <button
            type="button"
            className={authMode === AUTH_MODES.LOGIN ? 'is-active' : ''}
            onClick={handleShowLogin}
            aria-pressed={authMode === AUTH_MODES.LOGIN}
          >
            Iniciar sesion
          </button>
          <button
            type="button"
            className={authMode === AUTH_MODES.REGISTER ? 'is-active' : ''}
            onClick={handleShowRegister}
            aria-pressed={authMode === AUTH_MODES.REGISTER}
          >
            Crear cuenta
          </button>
        </div>

        {authError && (
          <p className="feedback-message feedback-message--error" role="alert">
            {authError}
          </p>
        )}

        {authMode === AUTH_MODES.LOGIN ? (
          <LoginForm
            onOperationStart={handleAuthOperationStart}
            onOperationEnd={handleAuthOperationEnd}
          />
        ) : (
          <RegisterForm
            onOperationStart={handleAuthOperationStart}
            onOperationEnd={handleAuthOperationEnd}
          />
        )}
      </section>
    </main>
  )
}

export default App
