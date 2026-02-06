import { z } from 'zod'

export const journalEntryLineSchema = z
  .object({
    accountId: z.number().min(1, 'Account is required'),
    accountLabel: z.string().optional(),
    accountNumber: z.string().optional(),
    thirdPartyId: z.number().optional(),
    description: z.string().min(1, 'Description is required'),
    debit: z.number().min(0).default(0),
    credit: z.number().min(0).default(0)
  })
  .refine((data) => data.debit > 0 || data.credit > 0, {
    message: 'Line must have a debit or credit amount',
    path: ['debit']
  })

export type JournalEntryLine = z.infer<typeof journalEntryLineSchema>

export const journalEntrySchema = z
  .object({
    date: z.date({
      message: 'Date is required'
    }),
    journalCode: z.string().min(1, 'Journal code is required'),
    reference: z.string().min(1, 'Reference is required'),
    description: z.string().min(1, 'Global description is required'),
    lines: z
      .array(journalEntryLineSchema)
      .min(2, 'At least 2 lines are required')
  })
  .refine(
    (data) => {
      const totalDebit = data.lines.reduce(
        (sum, line) => sum + (line.debit || 0),
        0
      )
      const totalCredit = data.lines.reduce(
        (sum, line) => sum + (line.credit || 0),
        0
      )
      return Math.abs(totalDebit - totalCredit) < 0.01 // Floating point tolerance
    },
    {
      message: 'Total Debit must equal Total Credit',
      path: ['lines'] // Attach error to lines field
    }
  )

export type JournalEntry = z.infer<typeof journalEntrySchema>
