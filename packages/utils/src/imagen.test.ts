import { describe, expect, it } from 'vitest'
import { MAX_BYTES, validarImagen } from './imagen'

/** `File` con tipo y tamaño controlados, sin escribir bytes de verdad. */
function archivo(type: string, size: number): File {
  const file = new File(['x'], 'foto.jpg', { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('validarImagen', () => {
  it('acepta JPG, PNG y WebP dentro del límite', () => {
    expect(validarImagen(archivo('image/jpeg', 1024))).toBeNull()
    expect(validarImagen(archivo('image/png', 1024))).toBeNull()
    expect(validarImagen(archivo('image/webp', 1024))).toBeNull()
  })

  it('rechaza un formato que no es de imagen', () => {
    expect(validarImagen(archivo('application/pdf', 1024))).toMatch(/Formato no permitido/)
  })

  it('rechaza un GIF: es imagen, pero no está en la lista', () => {
    expect(validarImagen(archivo('image/gif', 1024))).toMatch(/Formato no permitido/)
  })

  it('rechaza lo que pasa de 5 MB', () => {
    expect(validarImagen(archivo('image/jpeg', MAX_BYTES + 1))).toMatch(/máximo de 5 MB/)
  })

  it('el límite exacto sí pasa', () => {
    expect(validarImagen(archivo('image/jpeg', MAX_BYTES))).toBeNull()
  })
})
