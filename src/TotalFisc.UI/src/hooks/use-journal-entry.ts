import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

export const useJournalEntry = (id: string | null | undefined) => {
  return useQuery({
    queryKey: ['journal-entry', id],
    queryFn: async () => {
      if (!id) return null
      const response = await apiClient.get(`/JournalEntries/${id}`)
      return response.data
    },
    enabled: !!id
  })
}
