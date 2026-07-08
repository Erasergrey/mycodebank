import { lazy, Suspense } from 'react'
import { APP_SECTIONS } from '../../config/navigation'
import AppLayout from '../layout/AppLayout'

const DashboardPage = lazy(() => import('../../pages/DashboardPage'))
const DepositPage = lazy(() => import('../../pages/DepositPage'))
const HelpPage = lazy(() => import('../../pages/HelpPage'))
const SettingsPage = lazy(() => import('../../pages/SettingsPage'))
const TransactionsPage = lazy(() => import('../../pages/TransactionsPage'))
const TransferPage = lazy(() => import('../../pages/TransferPage'))
const WithdrawPage = lazy(() => import('../../pages/WithdrawPage'))

function PageLoadingFallback() {
  return (
    <section className="ui-card loading-panel app-page-loading" aria-live="polite">
      <p>Cargando vista...</p>
    </section>
  )
}

function AuthenticatedApp({
  activeSection,
  currentUser,
  logoutError,
  logoutLoading,
  onLogout,
  onNavigate,
  profile,
  profileError,
  profileLoading,
  profileRealtime,
  reloadProfile,
  retryTransactions,
  transactions,
  transactionsError,
  transactionsLoading,
}) {
  const dashboardProps = {
    currentUser,
    logoutLoading,
    onLogout,
    onNavigate,
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

  function renderPage() {
    switch (activeSection) {
      case APP_SECTIONS.TRANSFER:
        return (
          <TransferPage
            currentUser={currentUser}
            onGoDashboard={() => onNavigate(APP_SECTIONS.DASHBOARD)}
            onViewTransactions={() => onNavigate(APP_SECTIONS.TRANSACTIONS)}
            profile={profile}
            profileLoading={profileLoading}
          />
        )
      case APP_SECTIONS.TRANSACTIONS:
        return (
          <TransactionsPage
            onRetryTransactions={retryTransactions}
            onTransfer={() => onNavigate(APP_SECTIONS.TRANSFER)}
            transactions={transactions}
            transactionsError={transactionsError}
            transactionsLoading={transactionsLoading}
          />
        )
      case APP_SECTIONS.DEPOSIT:
        return (
          <DepositPage
            currentUser={currentUser}
            onGoDashboard={() => onNavigate(APP_SECTIONS.DASHBOARD)}
            onViewTransactions={() => onNavigate(APP_SECTIONS.TRANSACTIONS)}
            profile={profile}
            profileLoading={profileLoading}
          />
        )
      case APP_SECTIONS.WITHDRAW:
        return (
          <WithdrawPage
            currentUser={currentUser}
            onGoDashboard={() => onNavigate(APP_SECTIONS.DASHBOARD)}
            onViewTransactions={() => onNavigate(APP_SECTIONS.TRANSACTIONS)}
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

  return (
    <AppLayout
      activeSection={activeSection}
      currentUser={currentUser}
      logoutError={logoutError}
      logoutLoading={logoutLoading}
      onLogout={onLogout}
      onNavigate={onNavigate}
      profile={profile}
      profileError={profileError}
      profileLoading={profileLoading}
    >
      <Suspense fallback={<PageLoadingFallback />}>{renderPage()}</Suspense>
    </AppLayout>
  )
}

export default AuthenticatedApp
