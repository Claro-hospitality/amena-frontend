/** Escapa los comodines de LIKE para que el término se busque literal. */
function escaparComodines(termino: string): string {
  return termino.replace(/[\\%_]/g, (c) => `\\${c}`)
}

/**
 * Patrón `%término%` para un `ilike` de PostgREST.
 *
 * Los comodines van escapados a propósito: sin esto, buscar "50%" trae TODAS las filas y "a_b"
 * casa con "aXb". El `*` queda fuera: PostgREST lo traduce a `%` antes de que Postgres vea el
 * patrón, así que no hay forma de buscar un asterisco literal (y nadie los tiene en su nombre).
 */
export function patronIlike(termino: string): string {
  return `%${escaparComodines(termino.trim())}%`
}

/**
 * Condición `or` de PostgREST que busca el mismo término en varias columnas.
 *
 * El patrón va entre comillas dobles porque dentro de un `or(...)` la coma y los paréntesis
 * separan condiciones: un término con coma ("Robles, Ana") rompería la consulta. Dentro de las
 * comillas, PostgREST entiende `\"` y `\\` como escapes, así que se aplican encima del escapado
 * de comodines — son dos capas distintas y en este orden se destapan bien.
 */
export function orIlike(columnas: string[], termino: string): string {
  const patron = patronIlike(termino).replace(/(["\\])/g, '\\$1')
  return columnas.map((columna) => `${columna}.ilike."${patron}"`).join(',')
}
