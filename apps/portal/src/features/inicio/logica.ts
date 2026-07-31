/** Saludo según la hora del día (24h). */
export function saludoPorHora(hora: number): string {
  if (hora >= 5 && hora < 12) return 'Buenos días'
  if (hora >= 12 && hora < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

/** Emoji de día/noche según la hora. */
export function emojiPorHora(hora: number): string {
  return hora >= 6 && hora < 19 ? '☀️' : '🌙'
}

/** Primer nombre (para un saludo más cercano) a partir del nombre completo. */
export function primerNombre(nombre?: string | null): string {
  return (nombre ?? '').trim().split(/\s+/)[0] ?? ''
}

// Códigos WMO de Open-Meteo → descripción en español + emoji.
const CLIMA_WMO: Array<{ codigos: number[]; texto: string; emoji: string }> = [
  { codigos: [0], texto: 'Despejado', emoji: '☀️' },
  { codigos: [1, 2], texto: 'Parcialmente nublado', emoji: '⛅' },
  { codigos: [3], texto: 'Nublado', emoji: '☁️' },
  { codigos: [45, 48], texto: 'Niebla', emoji: '🌫️' },
  { codigos: [51, 53, 55, 56, 57], texto: 'Llovizna', emoji: '🌦️' },
  { codigos: [61, 63, 65, 66, 67, 80, 81, 82], texto: 'Lluvia', emoji: '🌧️' },
  { codigos: [71, 73, 75, 77, 85, 86], texto: 'Nieve', emoji: '🌨️' },
  { codigos: [95, 96, 99], texto: 'Tormenta', emoji: '⛈️' },
]

/** Describe un código WMO de clima con texto en español + emoji. */
export function describirClima(codigo: number): { texto: string; emoji: string } {
  return CLIMA_WMO.find((c) => c.codigos.includes(codigo)) ?? { texto: 'Clima actual', emoji: '🌡️' }
}
