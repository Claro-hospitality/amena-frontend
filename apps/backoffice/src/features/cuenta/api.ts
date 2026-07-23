import { supabase } from '@amena/supabase'

/**
 * Cambia la contraseña del usuario actual (Supabase Auth) y limpia el flag
 * `debe_cambiar_password` del backoffice. Si se pasa `actual`, primero se verifica
 * re-autenticando (Supabase no valida la contraseña previa en updateUser).
 */
export async function cambiarMiPassword({
  nueva,
  actual,
}: {
  nueva: string
  actual?: string
}): Promise<void> {
  if (actual !== undefined) {
    const { data } = await supabase.auth.getUser()
    const email = data.user?.email
    if (!email) throw new Error('No hay una sesión activa.')
    const { error } = await supabase.auth.signInWithPassword({ email, password: actual })
    if (error) throw new Error('La contraseña actual no es correcta.')
  }
  const { error } = await supabase.auth.updateUser({ password: nueva })
  if (error) throw error
  // Limpia el flag (no-op si el usuario no lo tenía). RPC SECURITY DEFINER.
  await supabase.rpc('confirmar_cambio_password_backoffice')
}
