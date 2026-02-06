import { createFileRoute } from '@tanstack/react-router'
import { Tiers } from '@/pages/Tiers'

export const Route = createFileRoute('/tiers')({
  component: Tiers
})
