export const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

/** Valida tipo y tamaño de la imagen; devuelve el mensaje de error o null si es válida. */
export function validarImagen(file: File): string | null {
  if (!TIPOS_IMAGEN.includes(file.type)) return 'Formato no permitido (usa JPG, PNG o WebP)'
  if (file.size > MAX_BYTES) return 'La imagen supera el máximo de 5 MB'
  return null
}
