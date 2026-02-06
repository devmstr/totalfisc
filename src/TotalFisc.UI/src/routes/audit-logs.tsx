import { createFileRoute } from '@tanstack/react-router'
import { AuditLogs } from '@/pages/AuditLogs'

export const Route = createFileRoute('/audit-logs')({
  component: AuditLogs
})
