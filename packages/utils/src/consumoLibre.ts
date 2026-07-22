// Utilidades puras para la política de "consumo libre" por empresa.
// Los días se expresan en ISO dow: 1=lunes … 5=viernes (solo días hábiles).

/** Días hábiles válidos para la política (lunes a viernes en ISO dow). */
export const DIAS_HABILES_ISO = [1, 2, 3, 4, 5] as const

/** Letra corta de cada día hábil, indexada por su ISO dow. */
const LETRA_DIA: Record<number, string> = { 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V' }

/**
 * Formatea los días permitidos como letras (L,M,X,J,V), en orden y sin duplicados.
 * Devuelve "—" si no hay días. Ej. [1,2,3,4,5] → "L, M, X, J, V".
 */
export function formatearDiasPermitidos(dias: number[]): string {
  const orden = [...new Set(dias)].filter((d) => d in LETRA_DIA).sort((a, b) => a - b)
  if (orden.length === 0) return '—'
  // Los 5 hábiles seguidos se leen mejor como "L-V".
  if (orden.length === 5) return 'L-V'
  return orden.map((d) => LETRA_DIA[d]).join(', ')
}

/** Formatea el límite diario legible: null = "ilimitado"; N = "N/día". */
export function formatearLimiteDiario(limite: number | null): string {
  return limite == null ? 'ilimitado' : `${limite}/día`
}

/**
 * Resumen legible de la política vigente, p. ej. "L-V, máx 2/día" o
 * "L, M, X, ilimitado". Si no hay días permitidos, indica que no aplica.
 */
export function resumenPoliticaConsumo(dias: number[], limite: number | null): string {
  const diasTxt = formatearDiasPermitidos(dias)
  if (diasTxt === '—') return 'Sin días permitidos'
  const limTxt = limite == null ? 'ilimitado' : `máx ${limite}/día`
  return `${diasTxt}, ${limTxt}`
}

/**
 * Ordinal simple en español para el conteo del día: 1 → "1ª", 2 → "2ª"…
 * Se usa para "Nª comida de hoy" en el escáner de consumo libre.
 */
export function ordinalComida(n: number): string {
  return `${n}ª`
}
