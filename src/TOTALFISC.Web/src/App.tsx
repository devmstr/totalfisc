import { DirectionProvider } from '@radix-ui/react-direction'
import { ThemeProvider } from './lib/theme-provider'
import { I18nProvider, useI18n } from './lib/i18n-context'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { Dashboard } from './pages/Dashboard'

const AppContent = () => {
  const { direction } = useI18n()

  return (
    <DirectionProvider dir={direction}>
      <div className="flex min-h-screen bg-background font-sans text-foreground">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        {/* ms-64 creates the margin-start (left in LTR, right in RTL) to accommodate the fixed sidebar */}
        <main className="flex-1 flex flex-col ms-64 transition-all duration-300 ease-in-out relative">
          <Header />
          <div className="flex-1 w-full p-0">
            <Dashboard />
          </div>
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
