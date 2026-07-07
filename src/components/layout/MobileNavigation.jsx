import LayoutIcon from './LayoutIcon'

function MobileNavigation({
  activeSection,
  id,
  isOpen,
  navItems,
  onClose,
  onLogout,
  onNavigate,
  logoutLoading,
}) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="mobile-navigation">
      <button
        type="button"
        className="mobile-navigation__overlay"
        onClick={onClose}
        aria-label="Cerrar menu movil"
      />

      <aside
        id={id}
        className="mobile-navigation__panel"
        aria-label="Navegacion movil"
      >
        <header className="mobile-navigation__header">
          <div className="app-sidebar__brand" aria-label="MYCODEBANK">
            <span className="app-sidebar__brand-mark" aria-hidden="true">
              XB
            </span>
            <span>
              <strong>MYCODEBANK</strong>
              <small>Banca digital</small>
            </span>
          </div>

          <button
            type="button"
            className="layout-icon-button"
            onClick={onClose}
            aria-label="Cerrar menu"
          >
            <LayoutIcon name="close" />
          </button>
        </header>

        <nav className="app-sidebar__nav" aria-label="Secciones moviles">
          {navItems.map((item) => {
            const isActive = item.id === activeSection

            return (
              <button
                key={item.id}
                type="button"
                className={isActive ? 'app-nav-item is-active' : 'app-nav-item'}
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                disabled={item.disabled}
              >
                <LayoutIcon name={item.icon} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <button
          type="button"
          className="app-nav-item app-nav-item--logout"
          onClick={onLogout}
          disabled={logoutLoading}
        >
          <LayoutIcon name="user" />
          <span>{logoutLoading ? 'Cerrando...' : 'Cerrar sesion'}</span>
        </button>
      </aside>
    </div>
  )
}

export default MobileNavigation
