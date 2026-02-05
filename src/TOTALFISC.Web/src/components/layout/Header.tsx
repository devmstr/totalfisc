import { useTranslation } from 'react-i18next'
import { useI18n } from '../../lib/i18n-context'
import { useTheme } from '../../lib/theme-context'
import { Icons } from '../Icons'

const teams = [
  {
    id: 'org1',
    name: 'TotalFisc Demo',
    plan: 'Enterprise',
    icon: 'Building' as const
  },
  {
    id: 'org2',
    name: 'My Company SARL',
    plan: 'Pro',
    icon: 'Building' as const
  }
]

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { OrgSwitcher } from './OrgSwitcher'

import { cn } from '@/lib/utils'

interface HeaderProps {
  onMenuClick: () => void
  activePage: string
  isScrolled?: boolean
}

export const Header = ({
  onMenuClick,
  // activePage removed if not used
  isScrolled
}: HeaderProps) => {
  const { t } = useTranslation()
  const { language, toggleLanguage } = useI18n()
  const { theme, setTheme } = useTheme()

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 transition-shadow duration-200',
        isScrolled ? 'shadow-sm' : 'shadow-none'
      )}
    >
      <div className="flex h-16 w-full items-center px-4">
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="me-2"
        >
          <Icons.Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>

        {/* Left: Breadcrumbs */}
        <div className="hidden md:flex me-4">
          <OrgSwitcher teams={teams} />
        </div>

        {/* Center: Org Switcher removed */}
        <div className="flex-1 flex justify-center">
          {/* Org Switcher moved to Sidebar */}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4 ms-auto">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-muted-foreground hover:text-foreground"
          >
            <Icons.Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Icons.Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="text-muted-foreground hover:text-foreground"
          >
            <Icons.Globe className="w-4 h-4 me-2" />
            <span className="text-xs font-bold uppercase">{language}</span>
          </Button>

          {/* Search */}
          <div className="relative hidden sm:block w-64">
            <Icons.Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder={t('common.search')}
              className="ps-10 h-9 bg-muted/50 border-none focus-visible:ring-1"
            />
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground"
          >
            <Icons.Bell className="w-5 h-5" />
            <span className="absolute top-2 end-2 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
          </Button>

          {/* User Profile */}
          <Avatar className="w-9 h-9 border border-border cursor-pointer hover:ring-2 hover:ring-ring transition-all">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback className="bg-primary text-primary-foreground font-medium">
              IS
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
