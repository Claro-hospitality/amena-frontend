import { describe, expect, it } from 'vitest'
import { esImagenPropia, IMAGEN_POR_OMISION, rutaDesdeUrlPublica } from './imagenEvento'

const URL_BUCKET =
  'http://localhost:54331/storage/v1/object/public/eventos/9f1c2e40-1111-4222-8333-444455556666.jpg'

describe('rutaDesdeUrlPublica', () => {
  it('saca la ruta del objeto de una URL de nuestro bucket', () => {
    expect(rutaDesdeUrlPublica(URL_BUCKET)).toBe('9f1c2e40-1111-4222-8333-444455556666.jpg')
  })

  it('funciona igual con el dominio de producción', () => {
    expect(
      rutaDesdeUrlPublica('https://xyz.supabase.co/storage/v1/object/public/eventos/foto.webp')
    ).toBe('foto.webp')
  })

  it('ignora el query string que agrega el CDN', () => {
    expect(rutaDesdeUrlPublica(`${URL_BUCKET}?t=123`)).toBe(
      '9f1c2e40-1111-4222-8333-444455556666.jpg'
    )
  })

  it('devuelve null para una URL ajena — no vamos a borrar lo que no es nuestro', () => {
    expect(rutaDesdeUrlPublica(IMAGEN_POR_OMISION)).toBeNull()
    expect(rutaDesdeUrlPublica('https://images.unsplash.com/photo-123')).toBeNull()
  })

  it('devuelve null para otro bucket, aunque sea del mismo Supabase', () => {
    expect(
      rutaDesdeUrlPublica('http://localhost:54331/storage/v1/object/public/platillos/x.jpg')
    ).toBeNull()
  })

  it('devuelve null con vacío o sin valor', () => {
    expect(rutaDesdeUrlPublica('')).toBeNull()
    expect(rutaDesdeUrlPublica(null)).toBeNull()
    expect(rutaDesdeUrlPublica(undefined)).toBeNull()
  })
})

describe('esImagenPropia', () => {
  it('la imagen por omisión no cuenta como propia', () => {
    expect(esImagenPropia(IMAGEN_POR_OMISION)).toBe(false)
  })

  it('vacío o sin valor tampoco', () => {
    expect(esImagenPropia('')).toBe(false)
    expect(esImagenPropia('   ')).toBe(false)
    expect(esImagenPropia(null)).toBe(false)
  })

  it('una imagen del bucket sí', () => {
    expect(esImagenPropia(URL_BUCKET)).toBe(true)
  })

  it('una imagen de un evento ya existente también: la regla es no publicar con la genérica', () => {
    expect(esImagenPropia('https://images.unsplash.com/photo-1612434644608-cc99f79cd818')).toBe(
      true
    )
  })
})
