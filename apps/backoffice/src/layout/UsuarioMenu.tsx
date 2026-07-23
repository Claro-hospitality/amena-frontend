import { useNavigate } from 'react-router-dom'
import { LogOut, UserRound } from 'lucide-react'
import { Avatar, AvatarFallback } from '@amena/ui/components/ui/avatar'
import { Button } from '@amena/ui/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@amena/ui/components/ui/dropdown-menu'
import { useAuth } from '../auth/useAuth'
import { useMiPerfil } from '../features/cuenta/queries'

/** Iniciales (1–2 letras) a partir del nombre o, si falta, del correo. */
function iniciales(texto: string): string {
  const limpio = texto.trim()
  if (!limpio) return '?'
  const palabras = limpio.split(/\s+/)
  const letras = palabras.length > 1 ? palabras[0][0] + palabras[1][0] : limpio.slice(0, 2)
  return letras.toUpperCase()
}

/**
 * Menú de usuario del navbar: avatar con iniciales que despliega el nombre/correo y las
 * acciones "Mi perfil" y "Cerrar sesión". Reemplaza los botones sueltos del header.
 */
export function UsuarioMenu() {
  const { session, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const { data: perfil } = useMiPerfil()

  const nombre = perfil?.nombre ?? ''
  const email = session?.user.email ?? ''

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Menú de usuario"
          >
            <Avatar>
              <AvatarFallback>{iniciales(nombre || email)}</AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="truncate text-sm font-medium">{nombre || 'Mi cuenta'}</span>
              {email && (
                <span className="truncate text-xs font-normal text-muted-foreground">{email}</span>
              )}
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/mi-perfil')}>
          <UserRound className="size-4" />
          Mi perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => cerrarSesion()}>
          <LogOut className="size-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
