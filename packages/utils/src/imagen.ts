export const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

/**
 * Valida tipo y tamaño de una imagen antes de subirla; devuelve el mensaje de error o null si
 * es válida. Es cortesía para dar un mensaje decente en el navegador — la barrera real son los
 * límites del bucket de Storage (`file_size_limit` y `allowed_mime_types`).
 */
export function validarImagen(file: File): string | null {
  if (!TIPOS_IMAGEN.includes(file.type)) return 'Formato no permitido (usa JPG, PNG o WebP)'
  if (file.size > MAX_BYTES) return 'La imagen supera el máximo de 5 MB'
  return null
}
