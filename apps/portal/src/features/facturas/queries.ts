import { useQuery } from '@tanstack/react-query'
import { listarMisFacturas } from './api'

export function useMisFacturas() {
  return useQuery({ queryKey: ['mis-facturas'], queryFn: listarMisFacturas })
}
