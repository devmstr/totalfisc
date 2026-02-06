import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'

const API_BASE_URL = 'http://localhost:5015/api'

export interface CreateAccountData {
  accountNumber: string
  label: string
  isSummary: boolean
  isAuxiliary: boolean
  parentAccountId?: string
}

export const useAccountsMutation = () => {
  const queryClient = useQueryClient()

  const createAccount = useMutation({
    mutationFn: async (data: CreateAccountData) => {
      const response = await axios.post(`${API_BASE_URL}/Accounts`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast.success('Account created successfully')
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to create account'
      toast.error(message)
    }
  })

  return {
    createAccount
  }
}
