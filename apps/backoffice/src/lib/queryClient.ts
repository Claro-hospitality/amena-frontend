import { QueryClient } from '@tanstack/react-query'

/** Cliente único de TanStack Query para el estado de servidor del backoffice. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
