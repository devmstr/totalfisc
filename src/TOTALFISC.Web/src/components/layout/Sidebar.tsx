import { useTranslation } from 'react-i18next'
import { Icons } from '../Icons'
import { cn } from '../../lib/utils'
import { useI18n } from '@/lib/i18n-context'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  activePage: string
  onNavigate: (page: string) => void
}

export const Sidebar = ({
  isOpen,
  onClose,
  activePage,
  onNavigate
}: SidebarProps) => {
  const { t } = useTranslation()
  const { language } = useI18n()
  const dir = language === 'ar' ? 'rtl' : 'ltr'

  const navItems = [
    {
      id: 'dashboard',
      label: t('common.dashboard'),
      icon: Icons.LayoutDashboard
    },
    {
      id: 'transactions',
      label: t('common.transactions'),
      icon: Icons.Banknote
    },
    {
      id: 'sales',
      label: t('common.sales'),
      icon: Icons.ShoppingCart
    },
    {
      id: 'purchases',
      label: t('common.purchases'),
      icon: Icons.ListOrdered
    },
    {
      id: 'tiers',
      label: t('common.tiers'),
      icon: Icons.Users
    },
    {
      id: 'reports',
      label: t('common.reports'),
      icon: Icons.FileText
    },
    {
      id: 'accounts',
      label: t('common.accounts'),
      icon: Icons.BookOpen
    },
    {
      id: 'fiscal-years',
      label: t('common.fiscal_years'),
      icon: Icons.Calendar
    },
    {
      id: 'audit-logs',
      label: t('audit.title', 'Audit Logs'),
      icon: Icons.Lock
    }
  ]

  const bottomItems = [
    {
      id: 'settings',
      label: t('common.settings'),
      icon: Icons.Settings
    }
  ]

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 pointer-events-none opacity-0',
          isOpen && 'opacity-100 pointer-events-auto'
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          'w-64 h-screen flex flex-col border-e border-sidebar-border shadow-xl fixed top-0 start-0 z-50 text-white overflow-hidden bg-gradient-to-b from-[hsl(var(--sidebar-from))] to-[hsl(var(--sidebar-to))] transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'
        )}
      >
        {/* The Noise Overlay Layer */}
        <div
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full 
  bg-linear-to-br from-emerald-400/30 to-transparent 
  blur-3xl pointer-events-none"
        />

        <div
          className="absolute bottom-0 -right-40 h-125 w-125 rounded-full 
  bg-linear-to-tr from-cyan-400/20 to-transparent 
  blur-3xl pointer-events-none"
        />

        {/* Header */}
        <div
          className={cn(
            'h-16 flex items-center px-4 border-b border-sidebar-border/10 font-bold text-xl tracking-tight select-none gap-1.5'
          )}
        >
          <img
            src="/logo-shape.svg"
            alt="Logo"
            className={cn('w-7 h-7', dir == 'rtl' ? 'scale-x-[-1]' : '')}
          />
          <div className="flex text-2xl">
            {dir == 'rtl' ? (
              <>
                <span className="text-white font-extrabold font-somar">
                  توتالـ
                </span>
                <span className={'text-white font-normal font-somar -mr-0.5'}>
                  فيسك
                </span>
              </>
            ) : (
              <>
                <span className="text-white font-extrabold ">TOTAL</span>
                <span className="text-white font-normal ">Fisc</span>
              </>
            )}
          </div>
          <span className="text-white font-normal text-xs mt-[0.62rem] font-somar ">
            v26
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id || '')}
              data-active={activePage === item.id}
              className="
              group
              flex items-center gap-3
              rounded-md px-3 py-2.5
              text-sm font-medium
              transition-colors
              text-sidebar-foreground/70
              hover:bg-sidebar-accent
              hover:text-sidebar-foreground
              data-[active=true]:bg-sidebar-active
              data-[active=true]:text-sidebar-foreground
              w-full
                "
            >
              <item.icon
                className="
        h-5 w-5
        shrink-0
        opacity-70
        transition-opacity
        group-hover:opacity-100
        data-[active=true]:opacity-100
        data-[active=true]:bg-sidebar-border
      "
              />
              <span className="flex-1 text-start">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border/10">
          {bottomItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id || '')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors duration-200 w-full"
            >
              <item.icon className="w-5 h-5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
              <span className="text-start">{item.label}</span>
            </button>
          ))}
        </div>
      </aside>
    </>
  )
}
