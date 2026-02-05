import type { AuditLogEntry } from '@/schemas/audit-log'
import { addMinutes, subDays } from 'date-fns'

const generateHash = (str: string) => {
  // Simple mock hash generation
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(64, '0')
}

const createMockLogs = (): AuditLogEntry[] => {
  const logs: AuditLogEntry[] = []
  const baseDate = subDays(new Date(), 2)
  let previousHash =
    '0000000000000000000000000000000000000000000000000000000000000000'

  const actions = [
    {
      action: 'CREATE',
      user: 'Admin',
      entity: 'FiscalYear',
      details: 'Opened FY 2026'
    },
    {
      action: 'CREATE',
      user: 'Accountant',
      entity: 'JournalEntry',
      details: 'Created JE-2026-001'
    },
    {
      action: 'UPDATE',
      user: 'Accountant',
      entity: 'JournalEntry',
      details: 'Updated JE-2026-001: Corrected amount'
    },
    {
      action: 'POST',
      user: 'Manager',
      entity: 'JournalEntry',
      details: 'Posted JE-2026-001'
    },
    {
      action: 'CREATE',
      user: 'Accountant',
      entity: 'ThirdParty',
      details: 'Created Client client_abc'
    },
    {
      action: 'CREATE',
      user: 'Accountant',
      entity: 'JournalEntry',
      details: 'Created JE-2026-002 (Sales)'
    },
    {
      action: 'POST',
      user: 'Manager',
      entity: 'JournalEntry',
      details: 'Posted JE-2026-002'
    },
    {
      action: 'CREATE',
      user: 'System',
      entity: 'Backup',
      details: 'Automated daily backup created'
    }
  ] as const

  actions.forEach((act, index) => {
    const timestamp = addMinutes(baseDate, index * 45)
    // Create a deterministic hash based on content + prevHash
    const content = `${timestamp.toISOString()}|${act.user}|${act.entity}|${act.details}|${previousHash}`
    const hash = generateHash(content)

    logs.push({
      id: `log-${index + 1}`,
      timestamp,
      action: act.action as any,
      user: act.user,
      entity: act.entity,
      details: act.details,
      hash,
      previousHash,
      status: 'valid'
    })

    previousHash = hash
  })

  return logs.reverse() // Show newest first usually, but for chain viz we might want oldest first? Let's keep newest first for table.
}

export const mockAuditLogs = createMockLogs()
