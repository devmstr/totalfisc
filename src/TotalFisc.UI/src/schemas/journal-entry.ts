import { z } from 'zod'
import type { TFunction } from 'i18next'

export const createJournalEntryLineSchema = (t: TFunction) =>
  z
    .object({
      accountId: z
        .string()
        .min(1, t('journal.form.validation.account_required')),
      accountLabel: z.string().optional(),
      accountNumber: z.string().optional(),
      thirdPartyId: z.string().optional(),
      description: z
        .string()
        .min(1, t('journal.form.validation.desc_required')),
      debit: z
        .number()
        .min(0, t('journal.form.validation.positive_amount'))
        .default(0),
      credit: z
        .number()
        .min(0, t('journal.form.validation.positive_amount'))
        .default(0)
    })
    .refine((data) => data.debit > 0 || data.credit > 0, {
      message: t('journal.form.validation.positive_amount'),
      path: ['debit']
    })

export const createJournalEntrySchema = (t: TFunction) =>
  z
    .object({
      date: z.date({
        message: t('journal.form.validation.required')
      }),
      journalCode: z.string().min(1, t('journal.form.validation.required')),
      reference: z.string().min(1, t('journal.form.validation.required')),
      description: z.string().min(1, t('journal.form.validation.required')),
      lines: z
        .array(createJournalEntryLineSchema(t))
        .min(2, t('journal.form.validation.min_lines'))
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
        message: t('journal.form.validation.unbalanced'),
        path: ['lines'] // Attach error to lines field
      }
    )

export type JournalEntry = {
  date: Date
  journalCode: string
  reference: string
  description: string
  lines: {
    accountId: string
    description: string
    debit: number
    credit: number
    accountLabel?: string
    accountNumber?: string
    thirdPartyId?: string
  }[]
}
