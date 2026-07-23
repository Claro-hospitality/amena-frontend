import { LogotipoAmena } from '@amena/ui/components/logotipo-amena'
import { Card, CardContent } from '@amena/ui/components/ui/card'
import { CambiarPasswordForm } from './CambiarPasswordForm'

/**
 * Pantalla de cambio de contraseña OBLIGATORIO al primer login (alta con temporal o
 * reset por super_admin). Se muestra en lugar del backoffice hasta completarla.
 */
export function CambioPasswordObligatorio({ onListo }: { onListo: () => void }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <LogotipoAmena className="mx-auto h-8 w-auto text-primary" />
        <Card className="shadow-none">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-lg font-semibold tracking-tight">Cambia tu contraseña</h1>
              <p className="text-sm text-muted-foreground">
                Por seguridad, define una contraseña nueva antes de continuar.
              </p>
            </div>
            <CambiarPasswordForm onListo={onListo} textoBoton="Guardar y continuar" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
