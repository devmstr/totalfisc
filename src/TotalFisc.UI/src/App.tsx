import { ThemeProvider } from './lib/theme-provider'
import { I18nProvider } from './lib/i18n-context'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/query-client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { Toaster } from '@/components/ui/sonner'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="totalfisc-theme">
      <I18nProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors />
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </QueryClientProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}

export default App
