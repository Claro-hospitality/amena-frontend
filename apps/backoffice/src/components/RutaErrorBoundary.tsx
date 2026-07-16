import type { ReactNode } from 'react'
import * as Sentry from '@sentry/react'
import { Button } from '@amena/ui/components/ui/button'

/**
 * Límite de error a nivel ruta: captura excepciones inesperadas, las reporta a
 * Sentry y muestra un fallback amable con reintento (nunca deja la app en blanco).
 */
export function RutaErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ resetError }) => (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-center">
          <h2 className="text-lg font-semibold">Algo salió mal</h2>
          <p className="max-w-sm text-muted-foreground">
            Ocurrió un error inesperado en esta sección. Ya lo registramos; intenta de nuevo.
          </p>
          <Button variant="outline" onClick={() => resetError()}>
            Reintentar
          </Button>
        </div>
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  )
}
