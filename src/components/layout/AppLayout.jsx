import { useId, useState } from 'react'
import { NAV_ITEMS } from '../../config/navigation'
import ErrorState from '../ui/ErrorState'
import Header from './Header'
import MobileNavigation from './MobileNavigation'
import Sidebar from './Sidebar'

function AppLayout({
  activeSection,
  children,
  currentUser,
  logoutError,
  logoutLoading,
  onLogout,
  onNavigate,
  profile,
  profileError,
  profileLoading,
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuId = useId()
  const layoutClasses = [
    'app-layout',
    isMobileMenuOpen ? 'app-layout--mobile-menu-open' : '',
  ]
    .filter(Boolean)
    .join(' ')

  function handleLayoutKeyDown(event) {
    if (event.key === 'Escape') {
      setIsMobileMenuOpen(false)
    }
  }

  function handleNavigate(sectionId) {
    onNavigate(sectionId)
    setIsMobileMenuOpen(false)
  }

  async function handleLogout() {
    setIsMobileMenuOpen(false)
    await onLogout()
  }

  return (
    <div className={layoutClasses} onKeyDown={handleLayoutKeyDown}>
      <Sidebar
        activeSection={activeSection}
        navItems={NAV_ITEMS}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        logoutLoading={logoutLoading}
      />

      <div className="app-layout__workspace">
        <Header
          currentUser={currentUser}
          isMobileMenuOpen={isMobileMenuOpen}
          logoutLoading={logoutLoading}
          mobileMenuId={mobileMenuId}
          onLogout={handleLogout}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          profile={profile}
          profileError={profileError}
          profileLoading={profileLoading}
        />

        <main className="app-main" id="main-content" tabIndex={-1}>
          {logoutError && (
            <div className="app-main__alert" role="alert">
              <ErrorState>{logoutError}</ErrorState>
            </div>
          )}
          {children}
        </main>
      </div>

      <MobileNavigation
        activeSection={activeSection}
        id={mobileMenuId}
        isOpen={isMobileMenuOpen}
        navItems={NAV_ITEMS}
        onClose={() => setIsMobileMenuOpen(false)}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        logoutLoading={logoutLoading}
      />
    </div>
  )
}

export default AppLayout
