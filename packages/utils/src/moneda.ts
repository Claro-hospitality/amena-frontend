const FORMATO_MXN = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
})

/** Formatea un número como moneda MXN (es-MX). Ej: 85 → "$85.00". */
export function formatearMoneda(monto: number): string {
  return FORMATO_MXN.format(monto)
}

/**
 * Extrae el número de un string con símbolos/separadores de moneda.
 * "$1,234.50" → 1234.5. Devuelve NaN si no hay dígitos.
 */
export function parsearMoneda(valor: string): number {
  const limpio = valor.replace(/[^\d.]/g, '')
  if (limpio === '') return NaN
  return Number(limpio)
}
