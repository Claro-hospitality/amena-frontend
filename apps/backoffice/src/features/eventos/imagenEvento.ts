/** Bucket público de Storage donde viven las imágenes destacadas (migración del backend). */
export const BUCKET_IMAGENES = 'eventos'

/**
 * Imagen genérica con la que se guarda un evento al que todavía no le suben foto. Existe porque
 * `eventos.imagen_url` es `not null` y la landing la pinta directo: una cadena vacía rompería su
 * layout. Un evento con esta imagen NO se puede publicar (ver `esImagenPropia`).
 */
export const IMAGEN_POR_OMISION =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080'

/** Prefijo de las URLs públicas del bucket, tal como las arma `getPublicUrl`. */
const PREFIJO_PUBLICO = `/storage/v1/object/public/${BUCKET_IMAGENES}/`

/**
 * Ruta del objeto dentro del bucket, o `null` si la URL no es de nuestro bucket. Es lo que
 * permite borrar la imagen anterior al reemplazarla sin intentar borrar algo que no es nuestro
 * (las imágenes de Unsplash de los eventos ya existentes caen en el `null`).
 */
export function rutaDesdeUrlPublica(url: string | null | undefined): string | null {
  if (!url) return null
  const i = url.indexOf(PREFIJO_PUBLICO)
  if (i === -1) return null
  const ruta = url.slice(i + PREFIJO_PUBLICO.length).split('?')[0]
  return ruta ? decodeURIComponent(ruta) : null
}

/**
 * ¿El evento tiene una imagen suya, o sigue con la genérica? Es la guarda de "no publicar con la
 * foto por omisión". Las imágenes de eventos que ya existían (URLs de Unsplash distintas de la
 * por omisión) cuentan como propias: la regla es que nada salga a amena.social con la genérica,
 * no que todo tenga que vivir en el bucket.
 */
export function esImagenPropia(url: string | null | undefined): boolean {
  if (!url || url.trim() === '') return false
  return url !== IMAGEN_POR_OMISION
}
