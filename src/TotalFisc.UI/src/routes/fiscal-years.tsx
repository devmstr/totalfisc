import { createFileRoute } from '@tanstack/react-router'
import { FiscalYears } from '@/pages/FiscalYears'

export const Route = createFileRoute('/fiscal-years')({
  component: FiscalYears
})
