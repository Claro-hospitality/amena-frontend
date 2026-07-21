import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@amena/supabase'
import { CLAVE_CONTADOR, CLAVE_LISTA } from './queries'

/**
 * Suscripción Realtime a los INSERT de `consumos`: mantiene el contador y la lista al día
 * aunque el consumo venga de otro dispositivo. Si el canal se cae, el `refetchInterval`
 * de las queries es el respaldo.
 */
export function useConsumosRealtime() {
  const qc = useQueryClient()
  useEffect(() => {
    const invalidar = () => {
      qc.invalidateQueries({ queryKey: CLAVE_CONTADOR })
      qc.invalidateQueries({ queryKey: CLAVE_LISTA })
    }
    const canal = supabase
      .channel('escaner-consumos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'consumos' }, invalidar)
      .subscribe()
    return () => {
      supabase.removeChannel(canal)
    }
  }, [qc])
}
