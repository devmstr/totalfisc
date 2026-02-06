import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

export interface JournalLineDto {
  accountId: string
  thirdPartyId?: string
  label: string
  debit: number
  credit: number
}

export interface JournalEntryDto {
  id: string
  entryNumber: string
  entryDate: string
  journalCode: string
  reference: string
  description: string
  status: string
  totalDebit: number
  totalCredit: number
  lines: JournalLineDto[]
  createdAt: string
}

export const useJournalEntries = (fiscalYearId: string, limit?: number) => {
  return useQuery<JournalEntryDto[]>({
    queryKey: ['journal-entries', fiscalYearId, limit],
    queryFn: async () => {
      const response = await apiClient.get('/journalentries', {
        params: { fiscalYearId, limit }
      })
      return response.data
    },
    enabled: !!fiscalYearId
  })
}
