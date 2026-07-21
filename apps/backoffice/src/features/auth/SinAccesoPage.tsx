import { Button } from '@amena/ui/components/ui/button'
import { useAuth } from '../../auth/useAuth'

/** Se muestra cuando hay sesión válida pero el usuario no está autorizado en este portal. */
export function SinAccesoPage() {
  const { cerrarSesion } = useAuth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <h1 className="text-xl font-semibold">No tienes acceso a este portal</h1>
      <p className="max-w-sm text-muted-foreground">
        Tu cuenta no está autorizada para el backoffice de Amena. Si crees que es un
        error, contacta a un administrador.
      </p>
      <Button variant="outline" onClick={() => cerrarSesion()}>
        Cerrar sesión
      </Button>
    </main>
  )
}
