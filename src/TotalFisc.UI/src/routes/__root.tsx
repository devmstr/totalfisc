import {
  createRootRoute,
  Outlet,
  useNavigate,
  useLocation
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { DirectionProvider } from '@radix-ui/react-direction'
import { useI18n } from '@/lib/i18n-context'

export const Route = createRootRoute({
  component: RootComponent
})

function RootComponent() {
  const { direction } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()

  // Map location to activePage ID for Sidebar highlighting
  const getActivePage = (pathname: string) => {
    if (pathname === '/') return 'dashboard'
    // Remove leading slash
    const page = pathname.substring(1)
    // Handle nested routes if necessary (e.g. /journal-entries/1 -> journal-entries)
    const firstSegment = page.split('/')[0]
    return firstSegment || 'dashboard'
  }

  const activePage = getActivePage(location.pathname)
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024)
  const [isScrolled, setIsScrolled] = useState(false)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollTop > 0)
  }

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

  const handleNavigate = (page: string) => {
    const to = page === 'dashboard' ? '/' : `/${page}`
    navigate({ to })
    if (window.innerWidth < 1024) setIsSidebarOpen(false)
  }

  return (
    <DirectionProvider dir={direction}>
      <div className="flex h-screen bg-background font-sans text-foreground overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activePage={activePage}
          onNavigate={handleNavigate}
        />

        <main
          className={cn(
            'h-full flex-1 flex flex-col transition-all duration-300 ease-in-out relative overflow-hidden',
            isSidebarOpen ? 'lg:ms-64' : 'ms-0'
          )}
        >
          <Header
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            activePage={activePage}
            isScrolled={isScrolled}
          />
          <ScrollArea
            className="flex-1 w-full"
            viewportProps={{ onScroll: handleScroll }}
          >
            <Outlet />
          </ScrollArea>
        </main>
        {/* <TanStackRouterDevtools /> */}
      </div>
    </DirectionProvider>
  )
}
