import { useEffect } from 'react'

/**
 * Mantiene la pantalla encendida mientras `activo` sea true (Screen Wake Lock API).
 * Best-effort: si el navegador no lo soporta o lo rechaza, no hace nada (degradación
 * silenciosa). Libera el lock al desactivarse o desmontar. Mismo patrón que el QR del portal.
 */
export function useWakeLock(activo: boolean) {
  useEffect(() => {
    if (!activo) return
    let lock: { release: () => Promise<void> } | null = null
    const wakeLock = (
      navigator as unknown as { wakeLock?: { request: (t: string) => Promise<typeof lock> } }
    ).wakeLock
    wakeLock
      ?.request('screen')
      .then((l) => {
        lock = l
      })
      .catch(() => {})
    return () => {
      lock?.release().catch(() => {})
    }
  }, [activo])
}
