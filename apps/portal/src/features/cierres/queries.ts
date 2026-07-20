import { useQuery } from '@tanstack/react-query'
import { listarMisCierres } from './api'

export function useMisCierres() {
  return useQuery({ queryKey: ['mis-cierres'], queryFn: listarMisCierres })
}
