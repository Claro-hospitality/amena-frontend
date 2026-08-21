import { describe, expect, it } from 'vitest'
import { orIlike, patronIlike } from './busqueda'

describe('patronIlike', () => {
  it('envuelve el término en comodines', () => {
    expect(patronIlike('ana')).toBe('%ana%')
  })

  it('recorta espacios', () => {
    expect(patronIlike('  ana  ')).toBe('%ana%')
  })

  it('escapa el porcentaje: "50%" no debe traer todo', () => {
    expect(patronIlike('50%')).toBe('%50\\%%')
  })

  it('escapa el guion bajo: "a_b" no debe casar con "aXb"', () => {
    expect(patronIlike('a_b')).toBe('%a\\_b%')
  })

  it('escapa la barra invertida', () => {
    expect(patronIlike('a\\b')).toBe('%a\\\\b%')
  })
})

describe('orIlike', () => {
  it('arma una condición por columna', () => {
    expect(orIlike(['nombre', 'email'], 'ana')).toBe(
      'nombre.ilike."%ana%",email.ilike."%ana%"'
    )
  })

  it('la coma del término no parte la condición', () => {
    // Sin las comillas, PostgREST leería "Robles" y " Ana" como dos condiciones distintas.
    expect(orIlike(['nombre'], 'Robles, Ana')).toBe('nombre.ilike."%Robles, Ana%"')
  })

  it('escapa las comillas dobles del término', () => {
    expect(orIlike(['nombre'], 'a"b')).toBe('nombre.ilike."%a\\"b%"')
  })

  it('los paréntesis viajan dentro de las comillas', () => {
    expect(orIlike(['folio'], 'AMN(1)')).toBe('folio.ilike."%AMN(1)%"')
  })

  it('el escapado de comodines sobrevive al de comillas', () => {
    // Dos capas: `\%` (comodín de LIKE) y luego `\\` (escape dentro de las comillas).
    expect(orIlike(['nombre'], '50%')).toBe('nombre.ilike."%50\\\\%%"')
  })
})
