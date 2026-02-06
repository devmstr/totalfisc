import { DirectionProvider } from '@radix-ui/react-direction'
import { ThemeProvider } from './lib/theme-provider'
import { I18nProvider, useI18n } from './lib/i18n-context'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { Dashboard } from './pages/Dashboard'
import { Transactions } from './pages/Transactions'
import { Sales } from './pages/Sales'
import { Purchases } from './pages/Purchases'
import { Tiers } from './pages/Tiers'
import { Reports } from './pages/Reports'
import { Accounts } from './pages/Accounts'
import { FiscalYears } from './pages/FiscalYears'
import { Settings } from './pages/Settings'
import { AuditLogs } from './pages/AuditLogs'
import { useState, useEffect } from 'react'
import { cn } from './lib/utils'
import { ScrollArea } from './components/ui/scroll-area'

const AppContent = () => {
  const { direction } = useI18n()
  const [activePage, setActivePage] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  // Auto-close sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />
      case 'transactions':
        return <Transactions />
      case 'accounts':
        return <Accounts />
      case 'sales':
        return <Sales />
      case 'purchases':
        return <Purchases />
      case 'tiers':
        return <Tiers />
      case 'reports':
        return <Reports />
      case 'fiscal-years':
        return <FiscalYears />
      case 'settings':
        return <Settings />
      case 'audit-logs':
        return <AuditLogs />
      default:
        return <Dashboard />
    }
  }

  const [isScrolled, setIsScrolled] = useState(false)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 0)
  }

  return (
    <DirectionProvider dir={direction}>
      <div className="flex  h-screen bg-background font-sans text-foreground overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activePage={activePage}
          onNavigate={(page) => {
            setActivePage(page)
            if (window.innerWidth < 1024) setIsSidebarOpen(false)
          }}
        />

        {/* Main Content Area */}
        <main
          className={cn(
            ' h-full flex-1 flex flex-col transition-all duration-300 ease-in-out relative overflow-hidden',
            isSidebarOpen ? 'lg:ms-64' : 'ms-0'
          )}
        >
          <Header
            onMenuClick={toggleSidebar}
            activePage={activePage}
            isScrolled={isScrolled}
          />
          <ScrollArea
            className="flex-1 w-full"
            viewportProps={{ onScroll: handleScroll }}
          >
            {renderPage()}
          </ScrollArea>
        </main>
      </div>
    </DirectionProvider>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="totalfisc-ui-theme">
      <I18nProvider>
        <AppContent />
      </I18nProvider>
    </ThemeProvider>
  )
}

export default App
