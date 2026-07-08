import { useEffect, useState } from 'react'
import AuthenticatedApp from './components/app/AuthenticatedApp'
import AuthScreen from './components/app/AuthScreen'
import useAppNavigation from './hooks/useAppNavigation'
import useRealtimeTransactions from './hooks/useRealtimeTransactions'
import useUserProfile from './hooks/useUserProfile'
import { logoutUser, subscribeToAuthState } from './services/authService'
import { getFirebaseErrorMessage } from './services/firebaseErrors'
import './styles/auth.css'
import './styles/dashboard.css'
import './styles/layout.css'

function LoadingScreen() {
  return (
    <main className="auth-shell">
      <section className="ui-card loading-panel" aria-live="polite">
        <p>Comprobando sesion...</p>
      </section>
    </main>
  )
}

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [authOperationInProgress, setAuthOperationInProgress] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const navigation = useAppNavigation({ authLoading, currentUser })
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

  function handleShowLogin() {
    setAuthError('')
    navigation.showLogin()
  }

  function handleShowRegister() {
    setAuthError('')
    navigation.showRegister()
  }

  function handleAuthOperationStart() {
    setAuthError('')
    setAuthOperationInProgress(true)
  }

  function handleAuthOperationEnd() {
    setAuthOperationInProgress(false)
  }

  function handleNavigate(sectionId) {
    if (navigation.navigateSection(sectionId)) {
      setLogoutError('')
    }
  }

  async function handleLogout() {
    if (logoutLoading) {
      return
    }

    setLogoutError('')
    setLogoutLoading(true)

    try {
      await logoutUser()
      navigation.resetToLogin()
    } catch (error) {
      setLogoutError(getFirebaseErrorMessage(error))
    } finally {
      setLogoutLoading(false)
    }
  }

  if (authLoading) {
    return <LoadingScreen />
  }

  if (currentUser && !authOperationInProgress) {
    return (
      <AuthenticatedApp
        activeSection={navigation.activeSection}
        currentUser={currentUser}
        logoutError={logoutError}
        logoutLoading={logoutLoading}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        profile={profile}
        profileError={profileError}
        profileLoading={profileLoading}
        profileRealtime={profileRealtime}
        reloadProfile={reloadProfile}
        retryTransactions={retryTransactions}
        transactions={transactions}
        transactionsError={transactionsError}
        transactionsLoading={transactionsLoading}
      />
    )
  }

  return (
    <AuthScreen
      authError={authError}
      authMode={navigation.authMode}
      onOperationEnd={handleAuthOperationEnd}
      onOperationStart={handleAuthOperationStart}
      onShowLogin={handleShowLogin}
      onShowRegister={handleShowRegister}
    />
  )
}

export default App
