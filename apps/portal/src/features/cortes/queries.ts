import { useQuery } from '@tanstack/react-query'
import { listarMisCortes } from './api'

export function useMisCortes() {
  return useQuery({ queryKey: ['mis-cortes'], queryFn: listarMisCortes })
}
