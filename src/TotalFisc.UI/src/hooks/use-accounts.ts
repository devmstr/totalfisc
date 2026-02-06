import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

export interface AccountDto {
  id: string
  accountNumber: string
  label: string
  isSummary: boolean
  isAuxiliary: boolean
  parentAccountId?: string
  class: string
}

export const useAccounts = () => {
  return useQuery<AccountDto[]>({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await apiClient.get('/accounts')
      return response.data
    }
  })
}
