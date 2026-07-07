import LayoutIcon from './LayoutIcon'

function Sidebar({
  activeSection,
  navItems,
  onLogout,
  onNavigate,
  logoutLoading,
}) {
  return (
    <aside className="app-sidebar" aria-label="Navegacion principal">
      <div className="app-sidebar__brand" aria-label="MYCODEBANK">
        <span className="app-sidebar__brand-mark" aria-hidden="true">
          XB
        </span>
        <span>
          <strong>MYCODEBANK</strong>
          <small>Banca digital</small>
        </span>
      </div>

      <nav className="app-sidebar__nav" aria-label="Secciones">
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

      <div className="app-sidebar__footer">
        <button
          type="button"
          className="app-nav-item app-nav-item--logout"
          onClick={onLogout}
          disabled={logoutLoading}
        >
          <LayoutIcon name="user" />
          <span>{logoutLoading ? 'Cerrando...' : 'Cerrar sesion'}</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
