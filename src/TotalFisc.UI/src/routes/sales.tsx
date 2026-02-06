import { createFileRoute } from '@tanstack/react-router'
import { Sales } from '@/pages/Sales'

export const Route = createFileRoute('/sales')({
  component: Sales
})
