import { supabase } from '@amena/supabase'
import type { Database } from '@amena/supabase/types'

export type Factura = Database['public']['Tables']['facturas']['Row']
export type EstadoFactura = Database['public']['Enums']['estado_factura']

/**
 * Facturas de la empresa del admin, más recientes primero. La RLS del backend restringe a su
 * empresa automáticamente (el admin solo ve las de su empresa). Solo lectura.
 */
export async function listarMisFacturas(): Promise<Factura[]> {
  const { data, error } = await supabase
    .from('facturas')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

/** Descarga un archivo (PDF/XML) del bucket privado `facturas` vía URL firmada de corta duración. */
export async function descargarArchivoFactura(path: string, nombre: string): Promise<void> {
  const { data, error } = await supabase.storage.from('facturas').createSignedUrl(path, 120)
  if (error) throw error
  const a = document.createElement('a')
  a.href = data.signedUrl
  a.download = nombre
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
}
