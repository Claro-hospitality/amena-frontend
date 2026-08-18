import { describe, expect, it } from 'vitest'
import { mensajeErrorCorreo } from './correo'

const CRUDO_POSTMARK =
  'You tried to send to recipient(s) that have been marked as inactive. Found inactive ' +
  'addresses: frontdesk2@mutuovive.mx. Inactive recipients are ones that have generated a ' +
  'hard bounce, a spam complaint, or a manual suppression.'

describe('mensajeErrorCorreo', () => {
  it('traduce el error real de Postmark que llegaba crudo a la UI', () => {
    const m = mensajeErrorCorreo(CRUDO_POSTMARK, { nombre: 'Ramón' })

    expect(m).toContain('de Ramón')
    expect(m).toMatch(/bloqueada/i)
    expect(m).toMatch(/verifica que la dirección sea correcta/i)
    // Nada del texto del proveedor debe filtrarse.
    expect(m).not.toMatch(/inactive|hard bounce|suppression/i)
  })

  it('reconoce el caso por código aunque el texto no venga', () => {
    expect(mensajeErrorCorreo(null, { codigo: 406 })).toMatch(/bloqueada/i)
  })

  it('distingue una dirección con formato inválido', () => {
    expect(mensajeErrorCorreo('Invalid email address', { codigo: 300 })).toMatch(
      /formato válido/i
    )
  })

  it('un error desconocido cae en un mensaje accionable, no en jerga', () => {
    const m = mensajeErrorCorreo('ECONNRESET tls handshake failed', { nombre: 'Ada' })

    expect(m).toBe('No pudimos enviar el correo de Ada. Vuelve a intentarlo en unos minutos.')
  })

  it('sin nombre, el mensaje sigue leyéndose bien', () => {
    expect(mensajeErrorCorreo(undefined)).toBe(
      'No pudimos enviar el correo. Vuelve a intentarlo en unos minutos.'
    )
  })
})
