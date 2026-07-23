import { Card, CardContent } from '@amena/ui/components/ui/card'
import { CambiarPasswordForm } from './CambiarPasswordForm'

/** Pantalla "Mi cuenta" (ruta /mi-cuenta): cambiar mi propia contraseña. */
export function MiCuentaPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <h1 className="text-xl font-semibold tracking-tight">Mi cuenta</h1>
      <Card className="shadow-none">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-semibold">Cambiar contraseña</h2>
            <p className="text-xs text-muted-foreground">
              Ingresa tu contraseña actual y define una nueva (mínimo 8 caracteres).
            </p>
          </div>
          <CambiarPasswordForm requiereActual textoBoton="Actualizar contraseña" />
        </CardContent>
      </Card>
    </div>
  )
}
