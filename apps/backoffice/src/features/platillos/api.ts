import { supabase } from '@amena/supabase'
import type { Database } from '@amena/supabase/types'

export type Platillo = Database['public']['Tables']['platillos']['Row']

export interface DatosPlatillo {
  nombre: string
  descripcion: string | null
  foto_url: string | null
}

export async function listarPlatillos(): Promise<Platillo[]> {
  const { data, error } = await supabase.from('platillos').select('*').order('nombre')
  if (error) throw error
  return data
}

export async function crearPlatillo(datos: DatosPlatillo): Promise<Platillo> {
  const { data, error } = await supabase.from('platillos').insert(datos).select().single()
  if (error) throw error
  return data
}

export async function actualizarPlatillo(id: string, datos: DatosPlatillo): Promise<Platillo> {
  const { data, error } = await supabase
    .from('platillos')
    .update(datos)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Baja lógica — no aparece al armar menús nuevos, conserva historial. */
export async function cambiarEstadoPlatillo(id: string, activo: boolean): Promise<Platillo> {
  const { data, error } = await supabase
    .from('platillos')
    .update({ activo })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Sube una foto al bucket público `platillos` (solo super_admin por RLS) y devuelve su URL pública. */
export async function subirFotoPlatillo(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const ruta = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage
    .from('platillos')
    .upload(ruta, file, { contentType: file.type })
  if (error) throw error
  return supabase.storage.from('platillos').getPublicUrl(ruta).data.publicUrl
}
