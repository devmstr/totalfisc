import { z } from 'zod'

export const auditLogEntrySchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  action: z.enum(['CREATE', 'UPDATE', 'DELETE', 'POST', 'void']),
  user: z.string(),
  entity: z.string(),
  entityId: z.string().optional(),
  details: z.string(),
  hash: z.string(),
  previousHash: z.string(),
  status: z.enum(['valid', 'tampered', 'broken']).default('valid')
})

export type AuditLogEntry = z.infer<typeof auditLogEntrySchema>
