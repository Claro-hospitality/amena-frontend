/** Clima actual (Open-Meteo). `codigo` es un código WMO (ver describirClima). */
export interface Clima {
  tempC: number
  codigo: number
}

/**
 * Clima actual según la ubicación del navegador (Open-Meteo: gratis, sin API key, con CORS).
 * Lanza si no hay geolocalización o el usuario niega el permiso → la UI oculta el clima.
 */
export async function obtenerClima(): Promise<Clima> {
  const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocalización no disponible'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 8000,
      maximumAge: 15 * 60 * 1000,
    })
  })

  const { latitude, longitude } = pos.coords
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
  const res = await fetch(url)
  if (!res.ok) throw new Error('No se pudo obtener el clima')

  const data = (await res.json()) as {
    current?: { temperature_2m?: number; weather_code?: number }
  }
  const temp = data.current?.temperature_2m
  const codigo = data.current?.weather_code
  if (temp == null || codigo == null) throw new Error('Respuesta de clima inválida')

  return { tempC: Math.round(temp), codigo }
}
