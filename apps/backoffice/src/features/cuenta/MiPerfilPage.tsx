import { Avatar, AvatarFallback } from '@amena/ui/components/ui/avatar'
import { Badge } from '@amena/ui/components/ui/badge'
import { Card, CardContent } from '@amena/ui/components/ui/card'
import { Skeleton } from '@amena/ui/components/ui/skeleton'
import { useAuth } from '../../auth/useAuth'
import type { RolBackoffice } from '../../auth/validarAccesoPortal'
import { CambiarPasswordForm } from './CambiarPasswordForm'
import { useMiPerfil } from './queries'

const ETIQUETA_ROL: Record<RolBackoffice, string> = {
  super_admin: 'Super administrador',
  finanzas: 'Finanzas',
  mesero: 'Mesero',
  capitan_meseros: 'Capitán de meseros',
  consulta: 'Consulta',
}

function iniciales(texto: string): string {
  const limpio = texto.trim()
  if (!limpio) return '?'
  const palabras = limpio.split(/\s+/)
  return (palabras.length > 1 ? palabras[0][0] + palabras[1][0] : limpio.slice(0, 2)).toUpperCase()
}

/** Pantalla "Mi perfil" (ruta /mi-perfil): datos del usuario + restablecer contraseña. */
export function MiPerfilPage() {
  const { session } = useAuth()
  const { data: perfil, isLoading } = useMiPerfil()
  const email = session?.user.email ?? ''

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      {/* Información del usuario */}
      <Card className="shadow-none">
        <CardContent className="flex flex-col gap-5 p-5">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarFallback>{iniciales(perfil?.nombre || email)}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col gap-1">
              {isLoading ? (
                <Skeleton className="h-5 w-40" />
              ) : (
                <span className="truncate font-medium">{perfil?.nombre || '—'}</span>
              )}
              {perfil && <Badge variant="secondary">{ETIQUETA_ROL[perfil.rol]}</Badge>}
            </div>
          </div>

          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Nombre</dt>
            <dd className="min-w-0 truncate">{perfil?.nombre || '—'}</dd>
            <dt className="text-muted-foreground">Correo</dt>
            <dd className="min-w-0 truncate">{email || '—'}</dd>
            <dt className="text-muted-foreground">Rol</dt>
            <dd>{perfil ? ETIQUETA_ROL[perfil.rol] : '—'}</dd>
          </dl>
        </CardContent>
      </Card>

      {/* Restablecer contraseña */}
      <Card className="shadow-none">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-semibold">Restablecer contraseña</h2>
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
