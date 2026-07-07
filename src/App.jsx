import { useEffect, useState } from 'react'
import LoginForm from './components/auth/LoginForm'
import RegisterForm from './components/auth/RegisterForm'
import AppLayout from './components/layout/AppLayout'
import {
  APP_SECTIONS,
  DEFAULT_SECTION,
  getNavigationItem,
  getSectionFromPath,
} from './config/navigation'
import DashboardPage from './pages/DashboardPage'
import DepositPage from './pages/DepositPage'
import HelpPage from './pages/HelpPage'
import SettingsPage from './pages/SettingsPage'
import TransactionsPage from './pages/TransactionsPage'
import TransferPage from './pages/TransferPage'
import WithdrawPage from './pages/WithdrawPage'
import { logoutUser, subscribeToAuthState } from './services/authService'
import { getFirebaseErrorMessage } from './services/firebaseErrors'
import { subscribeToUserProfile } from './services/userService'
import './styles/auth.css'
import './styles/dashboard.css'
import './styles/layout.css'

const AUTH_MODES = {
  LOGIN: 'login',
  REGISTER: 'register',
}

function getInitialSection() {
  if (typeof window === 'undefined') {
    return DEFAULT_SECTION
  }

  return getSectionFromPath(window.location.pathname)
}

function App() {
  const [authMode, setAuthMode] = useState(AUTH_MODES.LOGIN)
  const [activeSection, setActiveSection] = useState(getInitialSection)
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [authOperationInProgress, setAuthOperationInProgress] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(
      (user) => {
        setCurrentUser(user)
        setAuthError('')
        setLogoutError('')
        setProfile(null)
        setProfileError('')
        setProfileLoading(Boolean(user))
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
    if (typeof window === 'undefined') {
      return undefined
    }

    function handlePopState() {
      setActiveSection(getSectionFromPath(window.location.pathname))
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    if (!currentUser?.uid) {
      setProfile(null)
      setProfileLoading(false)
      setProfileError('')
      return undefined
    }

    setProfile(null)
    setProfileLoading(true)
    setProfileError('')

    try {
      const unsubscribe = subscribeToUserProfile(
        currentUser.uid,
        (profileData) => {
          setProfile(profileData)
          setProfileLoading(false)
        },
        (error) => {
          setProfileError(getFirebaseErrorMessage(error))
          setProfileLoading(false)
        },
      )

      return unsubscribe
    } catch (error) {
      setProfileError(getFirebaseErrorMessage(error))
      setProfileLoading(false)
      return undefined
    }
  }, [currentUser?.uid])

  function handleShowLogin() {
    setAuthMode(AUTH_MODES.LOGIN)
  }

  function handleShowRegister() {
    setAuthMode(AUTH_MODES.REGISTER)
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

      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.history.replaceState(null, '', '/')
      }
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

    if (
      typeof window !== 'undefined' &&
      window.location.pathname !== item.path
    ) {
      window.history.pushState(null, '', item.path)
    }
  }

  function renderAuthenticatedPage() {
    const dashboardProps = {
      currentUser,
      profile,
      profileLoading,
      profileError,
    }

    switch (activeSection) {
      case APP_SECTIONS.TRANSFER:
        return <TransferPage />
      case APP_SECTIONS.TRANSACTIONS:
        return <TransactionsPage />
      case APP_SECTIONS.DEPOSIT:
        return <DepositPage />
      case APP_SECTIONS.WITHDRAW:
        return <WithdrawPage />
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
