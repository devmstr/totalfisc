import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import { toast } from '@/components/ui/sonner'
import type { JournalEntry } from '@/schemas/journal-entry'

export const useCreateJournalEntry = (fiscalYearId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: JournalEntry) => {
      const response = await apiClient.post('/JournalEntries', {
        journalCode: data.journalCode,
        description: data.description,
        entryDate: data.date,
        fiscalYearId: fiscalYearId || '00000000-0000-0000-0000-000000000000',
        lines: data.lines.map((line) => ({
          accountId: line.accountId,
          label: line.description || data.description,
          debit: line.debit,
          credit: line.credit
        })),
        reference: data.reference
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
      toast.success('Journal entry created successfully')
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to create journal entry'
      toast.error(message)
    }
  })
}

export const usePostJournalEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/JournalEntries/${id}/post`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
      toast.success('Journal entry posted successfully')
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to post journal entry'
      toast.error(message)
    }
  })
}

export const useUpdateJournalEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: JournalEntry }) => {
      const response = await apiClient.put(`/JournalEntries/${id}`, {
        id,
        journalCode: data.journalCode,
        description: data.description,
        entryDate: data.date,
        lines: data.lines.map((line) => ({
          accountId: line.accountId,
          label: line.description || data.description,
          debit: line.debit,
          credit: line.credit
        })),
        reference: data.reference
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
      toast.success('Journal entry updated successfully')
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to update journal entry'
      toast.error(message)
    }
  })
}

export const useDeleteJournalEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/JournalEntries/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
      toast.success('Journal entry deleted successfully')
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to delete journal entry'
      toast.error(message)
    }
  })
}
