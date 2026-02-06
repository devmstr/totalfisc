import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

export interface FiscalYear {
  id: string
  yearNumber: number
  startDate: string
  endDate: string
  status: 'Open' | 'Locked' | 'Closed'
}

export const useFiscalYears = () => {
  return useQuery<FiscalYear[]>({
    queryKey: ['fiscal-years'],
    queryFn: async () => {
      const response = await apiClient.get('/FiscalYears')
      return response.data
    }
  })
}
