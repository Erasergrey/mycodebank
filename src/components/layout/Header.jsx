import { useEffect, useRef, useState } from 'react'
import LayoutIcon from './LayoutIcon'

const dateFormatter = new Intl.DateTimeFormat('es-CL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) {
    return 'Buenos dias'
  }

  if (hour < 20) {
    return 'Buenas tardes'
  }

  return 'Buenas noches'
}

function getDisplayName({ currentUser, profile, profileLoading }) {
  if (profileLoading) {
    return 'Cuenta XBank'
  }

  return (
    profile?.nombre?.trim() ||
    currentUser?.displayName?.trim() ||
    'Usuario sin nombre'
  )
}

function getDisplayEmail({ currentUser, profile }) {
  return profile?.email ?? currentUser?.email ?? 'Cuenta XBank'
}

function getInitials(value) {
  const source = value?.trim() || 'Usuario'
  const parts = source.split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? 'U'
  const second = parts.length > 1 ? parts[1][0] : ''

  return `${first}${second}`.toUpperCase()
}

function Header({
  currentUser,
  isMobileMenuOpen,
  logoutLoading,
  mobileMenuId,
  onLogout,
  onOpenMobileMenu,
  profile,
  profileError,
  profileLoading,
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)
  const displayName = getDisplayName({ currentUser, profile, profileLoading })
  const displayEmail = getDisplayEmail({ currentUser, profile })
  const initials = getInitials(
    displayName === 'Usuario sin nombre' ? displayEmail : displayName,
  )
  const formattedDate = dateFormatter.format(new Date())

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false)
      }
    }

    function handlePointerDown(event) {
      if (!userMenuRef.current?.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [])

  async function handleLogout() {
    setIsUserMenuOpen(false)
    await onLogout()
  }

  return (
    <header className="app-header">
      <button
        type="button"
        className="layout-icon-button app-header__menu-button"
        onClick={onOpenMobileMenu}
        aria-controls={mobileMenuId}
        aria-expanded={isMobileMenuOpen}
        aria-label="Abrir menu de navegacion"
      >
        <LayoutIcon name="menu" />
      </button>

      <div className="app-header__copy">
        <p className="app-header__date">{formattedDate}</p>
        <h1>
          {getGreeting()}, {displayName}
        </h1>
        <p>
          {profileError
            ? 'No fue posible cargar todos los datos de tu perfil.'
            : 'Aqui tienes el resumen de tu cuenta'}
        </p>
      </div>

      <div className="app-header__actions">
        <button
          type="button"
          className="layout-icon-button"
          aria-label="Notificaciones proximamente"
          title="Notificaciones proximamente"
          disabled
        >
          <LayoutIcon name="bell" />
        </button>

        <div className="user-menu" ref={userMenuRef}>
          <button
            type="button"
            className="user-menu__trigger"
            onClick={() => setIsUserMenuOpen((isOpen) => !isOpen)}
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
          >
            <span className="user-menu__avatar" aria-hidden="true">
              {initials}
            </span>
            <span className="user-menu__identity">
              <strong>{displayName}</strong>
              <small>{displayEmail}</small>
            </span>
          </button>

          {isUserMenuOpen && (
            <div className="user-menu__panel">
              <p>{displayEmail}</p>
              <button
                type="button"
                className="user-menu__logout"
                onClick={handleLogout}
                disabled={logoutLoading}
              >
                {logoutLoading ? 'Cerrando sesion...' : 'Cerrar sesion'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
