import { useTranslation } from 'react-i18next'
import { Icons } from '../Icons'
import { OrgSwitcher } from './OrgSwitcher'

export const Sidebar = () => {
  const { t } = useTranslation()

  const navItems = [
    {
      label: t('common.dashboard'),
      icon: Icons.LayoutDashboard,
      active: true
    },
    {
      label: t('common.transactions'),
      icon: Icons.Banknote,
      active: false
    },
    {
      label: t('common.sales'),
      icon: Icons.ShoppingCart,
      active: false
    },
    {
      label: t('common.purchases'),
      icon: Icons.ListOrdered,
      active: false
    },
    {
      label: t('common.tiers'),
      icon: Icons.Users,
      active: false
    },
    {
      label: t('common.reports'),
      icon: Icons.FileText,
      active: false
    }
  ]

  const bottomItems = [
    {
      label: t('common.settings'),
      icon: Icons.Settings,
      active: false
    }
  ]

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground h-screen flex flex-col border-e border-sidebar-border shadow-xl fixed top-0 start-0 z-50">
      {/* Header */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border/10">
        <OrgSwitcher />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => (
          <a
            key={index}
            href="#"
            className={`
              flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 group
              ${
                item.active
                  ? 'bg-sidebar-primary/10 text-white'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/10 hover:text-white'
              }
            `}
          >
            <item.icon
              className={`w-5 h-5 me-3 rtl:flip ${item.active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}
            />
            <span className="flex-1 text-start">{item.label}</span>
            {/* Chevron example if needed, forcing start/end alignment awareness */}
          </a>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border/10">
        {bottomItems.map((item, index) => (
          <a
            key={index}
            href="#"
            className="flex items-center px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/10 hover:text-white transition-colors duration-200"
          >
            <item.icon className="w-5 h-5 me-3 text-gray-400 group-hover:text-white" />
            <span className="text-start">{item.label}</span>
          </a>
        ))}
      </div>
    </aside>
  )
}
