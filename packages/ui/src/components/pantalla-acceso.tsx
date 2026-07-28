import { useState, type FormEvent } from "react"
import { Mail } from "lucide-react"

import { cn } from "@amena/ui/lib/utils"
import { Button } from "@amena/ui/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@amena/ui/components/ui/field"
import { Input } from "@amena/ui/components/ui/input"
import {
  CampoPassword,
  EncabezadoAcceso,
  MarcoAcceso,
} from "@amena/ui/components/marco-acceso"

/**
 * Pantalla de acceso (login) compartida por backoffice y portal. Presentacional: la autenticación
 * se inyecta con `onIniciarSesion` (que además navega al éxito). Usa el `MarcoAcceso` (video de
 * marca + tarjeta glass en móvil).
 */
export function PantallaAcceso({
  subtitulo,
  onIniciarSesion,
  videoSrc,
  poster,
}: {
  /** Nombre del entorno bajo el saludo (p. ej. "Portal de empresas" / "Backoffice"). */
  subtitulo: string
  /** Autentica y, si tiene éxito, navega. Si rechaza, se muestra el error. */
  onIniciarSesion: (email: string, password: string) => Promise<void>
  videoSrc?: string
  poster?: string
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function onSubmit(evento: FormEvent) {
    evento.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await onIniciarSesion(email, password)
    } catch {
      setError("Credenciales inválidas. Verifica tu correo y contraseña.")
      setEnviando(false)
    }
  }

  return (
    <MarcoAcceso videoSrc={videoSrc} poster={poster}>
      <EncabezadoAcceso
        titulo="Bienvenido de vuelta"
        subtitulo={<>Inicia sesión para continuar · {subtitulo}</>}
      />

      <form onSubmit={onSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Correo</FieldLabel>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="pl-9"
              />
            </div>
          </Field>

          <CampoPassword
            id="password"
            label="Contraseña"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          {error && (
            <FieldError role="alert" className={cn("rounded-lg bg-destructive/10 px-3 py-2")}>
              {error}
            </FieldError>
          )}

          <Button type="submit" size="lg" className="mt-1 w-full" loading={enviando}>
            Entrar
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        ¿Problemas para entrar? Contacta al administrador de tu cuenta.
      </p>
    </MarcoAcceso>
  )
}
