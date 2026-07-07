import { useEffect, useRef, useState } from 'react'
import {
  getDisplayEmail,
  getDisplayName,
  getInitials,
} from '../../utils/userDisplay'
import LayoutIcon from './LayoutIcon'

const dateFormatter = new Intl.DateTimeFormat('es-CL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
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
  const displayName = getDisplayName({ currentUser, profile })
  const displayEmail = getDisplayEmail({ currentUser, profile })
  const initials = getInitials(displayName)
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
        <h1 aria-live="polite">
          {profileLoading ? (
            <span
              className="header-skeleton header-skeleton--title"
              aria-label="Cargando perfil"
            />
          ) : (
            `${getGreeting()}, ${displayName}`
          )}
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
            {profileLoading ? (
              <span
                className="user-menu__avatar user-menu__avatar--loading"
                aria-hidden="true"
              />
            ) : (
              <span className="user-menu__avatar" aria-hidden="true">
                {initials}
              </span>
            )}
            <span className="user-menu__identity">
              {profileLoading ? (
                <>
                  <span className="header-skeleton header-skeleton--name" />
                  <span className="header-skeleton header-skeleton--email" />
                </>
              ) : (
                <>
                  <strong>{displayName}</strong>
                  <small>{displayEmail}</small>
                </>
              )}
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
