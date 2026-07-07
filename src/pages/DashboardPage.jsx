import Dashboard from '../components/dashboard/Dashboard'
import { APP_SECTIONS } from '../config/navigation'
import { getAccountIdentifier, getDisplayEmail, getDisplayName } from '../utils/userDisplay'

function DashboardPage({
  currentUser,
  logoutLoading,
  onLogout,
  onNavigate,
  profile,
  profileError,
  profileLoading,
  profileRealtime,
  reloadProfile,
}) {
  const displayName = getDisplayName({ currentUser, profile })
  const displayEmail = getDisplayEmail({ currentUser, profile })
  const accountIdentifier = getAccountIdentifier(currentUser?.uid)

  return (
    <Dashboard
      accountIdentifier={accountIdentifier}
      balance={profile?.saldo ?? null}
      createdAt={profile?.creadoEn}
      displayEmail={displayEmail}
      displayName={displayName}
      hasProfile={Boolean(profile)}
      isProfileLoading={profileLoading}
      isRealtime={profileRealtime}
      logoutLoading={logoutLoading}
      onDeposit={() => onNavigate(APP_SECTIONS.DEPOSIT)}
      onLogout={onLogout}
      onRetryProfile={reloadProfile}
      onTransfer={() => onNavigate(APP_SECTIONS.TRANSFER)}
      onViewTransactions={() => onNavigate(APP_SECTIONS.TRANSACTIONS)}
      onWithdraw={() => onNavigate(APP_SECTIONS.WITHDRAW)}
      profileError={profileError}
    />
  )
}

export default DashboardPage
