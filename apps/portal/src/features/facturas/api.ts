import { supabase } from '@amena/supabase'
import type { Database } from '@amena/supabase/types'
import { zipSync } from 'fflate'
import { obtenerMiEmpresaId } from '../../lib/empresaActual'

export type Factura = Database['public']['Tables']['facturas']['Row']
export type EstadoFactura = Database['public']['Enums']['estado_factura']

/**
 * Facturas de la empresa del admin, más recientes primero. Se acota explícitamente por
 * `empresa_id` (no basta la RLS: una cuenta con rol de backoffice vería todas las empresas).
 * Solo lectura.
 */
export async function listarMisFacturas(): Promise<Factura[]> {
  const empresaId = await obtenerMiEmpresaId()
  const { data, error } = await supabase
    .from('facturas')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
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
