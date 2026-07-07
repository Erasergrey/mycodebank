export const APP_SECTIONS = {
  DASHBOARD: 'dashboard',
  TRANSFER: 'transfer',
  TRANSACTIONS: 'transactions',
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw',
  SETTINGS: 'settings',
  HELP: 'help',
}

export const DEFAULT_SECTION = APP_SECTIONS.DASHBOARD

export const NAV_ITEMS = [
  {
    id: APP_SECTIONS.DASHBOARD,
    label: 'Inicio',
    path: '/dashboard',
    icon: 'home',
  },
  {
    id: APP_SECTIONS.TRANSFER,
    label: 'Transferir',
    path: '/transfer',
    icon: 'transfer',
  },
  {
    id: APP_SECTIONS.TRANSACTIONS,
    label: 'Movimientos',
    path: '/transactions',
    icon: 'transactions',
  },
  {
    id: APP_SECTIONS.DEPOSIT,
    label: 'Depositar',
    path: '/deposit',
    icon: 'deposit',
  },
  {
    id: APP_SECTIONS.WITHDRAW,
    label: 'Retirar',
    path: '/withdraw',
    icon: 'withdraw',
  },
  {
    id: APP_SECTIONS.SETTINGS,
    label: 'Configuracion',
    path: '/settings',
    icon: 'settings',
  },
  {
    id: APP_SECTIONS.HELP,
    label: 'Ayuda',
    path: '/help',
    icon: 'help',
  },
]

export function getNavigationItem(sectionId) {
  return NAV_ITEMS.find((item) => item.id === sectionId)
}

export function getSectionFromPath(pathname) {
  const item = NAV_ITEMS.find((navItem) => navItem.path === pathname)

  return item?.id ?? DEFAULT_SECTION
}
