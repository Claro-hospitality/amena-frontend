import { supabase } from '@amena/supabase'
import type { Database } from '@amena/supabase/types'
import { zipSync } from 'fflate'

export type Factura = Database['public']['Tables']['facturas']['Row']
export type EstadoFactura = Database['public']['Enums']['estado_factura']

/**
 * Ambiente de timbrado activo, derivado del Supabase al que apunta el front (mismo criterio que el
 * guard del backend): local → sandbox; cloud → producción. Se muestra read-only en la UI.
 */
export const AMBIENTE_FACTURAMA: 'sandbox' | 'prod' = /localhost|127\.0\.0\.1|kong/.test(
  import.meta.env.VITE_SUPABASE_URL ?? '',
)
  ? 'sandbox'
  : 'prod'

/** Factura de un corte (1:1). `null` si el corte aún no se ha facturado. */
export async function facturaDeCorte(corteId: number): Promise<Factura | null> {
  const { data, error } = await supabase
    .from('facturas')
    .select('*')
    .eq('corte_id', corteId)
    .maybeSingle()
  if (error) throw error
  return data
}

export interface ResultadoFacturar {
  ok: boolean
  factura: Factura
  pdf_url: string | null
  xml_url: string | null
}

/**
 * Dispara la emisión (timbrado) de un corte vía la Edge Function `facturar-corte`. Normaliza el
 * error del SAT/Facturama (extrae el `{error}` del cuerpo) para mostrarlo tal cual al usuario.
 */
export async function facturarCorte(corteId: number): Promise<ResultadoFacturar> {
  const { data, error } = await supabase.functions.invoke('facturar-corte', {
    body: { corte_id: corteId },
  })
  if (error) {
    let mensaje = 'No se pudo facturar el corte. Intenta de nuevo.'
    const resp = (error as { context?: Response }).context
    if (resp && typeof resp.json === 'function') {
      try {
        const b = await resp.json()
        if (b?.error) mensaje = b.error
      } catch {
        /* sin cuerpo JSON */
      }
    }
    throw new Error(mensaje)
  }
  return data as ResultadoFacturar
}

/** URL firmada de corta duración para un objeto del bucket privado `facturas`. */
export async function urlFirmadaFactura(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from('facturas').createSignedUrl(path, 120)
  if (error) throw error
  return data.signedUrl
}

/** Baja los bytes de un objeto del bucket vía su URL firmada. */
async function bytesDeArchivo(path: string): Promise<Uint8Array> {
  const url = await urlFirmadaFactura(path)
  const res = await fetch(url)
  if (!res.ok) throw new Error('No se pudo descargar el archivo.')
  return new Uint8Array(await res.arrayBuffer())
}

/** Descarga un ZIP con el PDF y el XML de la factura en un solo archivo. */
export async function descargarFacturaZip(factura: {
  folio: string
  pdf_url: string | null
  xml_url: string | null
}): Promise<void> {
  const archivos: Record<string, Uint8Array> = {}
  if (factura.pdf_url) archivos[`factura-${factura.folio}.pdf`] = await bytesDeArchivo(factura.pdf_url)
  if (factura.xml_url) archivos[`factura-${factura.folio}.xml`] = await bytesDeArchivo(factura.xml_url)
  const zip = zipSync(archivos)
  const blob = new Blob([zip], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `factura-${factura.folio}.zip`
  a.click()
  URL.revokeObjectURL(url)
}
