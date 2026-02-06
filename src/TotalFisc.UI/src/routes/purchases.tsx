import { createFileRoute } from '@tanstack/react-router'
import { Purchases } from '@/pages/Purchases'

export const Route = createFileRoute('/purchases')({
  component: Purchases
})
