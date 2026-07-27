import { useEffect, useRef, useState, type FormEvent } from "react"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"

import { cn } from "@amena/ui/lib/utils"
import { Button } from "@amena/ui/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@amena/ui/components/ui/field"
import { Input } from "@amena/ui/components/ui/input"
import { LogotipoAmena } from "@amena/ui/components/logotipo-amena"

const VIDEO_POR_DEFECTO = "/videos/general-amena.mp4"

/**
 * Pantalla de acceso (login) compartida por backoffice y portal. Presentacional: la autenticación
 * se inyecta con `onIniciarSesion` (que además navega al éxito).
 *
 * Layout responsivo con el video de marca de fondo:
 *  - Escritorio (lg+): split — video a la IZQUIERDA (con el logotipo centrado encima) y el
 *    formulario a la derecha sobre un panel sólido (crema).
 *  - Móvil / tablet: el video ocupa TODO el fondo (más oscuro) y el formulario va encima en una
 *    tarjeta translúcida tipo "liquid glass" (blur), con el logo dentro.
 */
export function PantallaAcceso({
  subtitulo,
  onIniciarSesion,
  videoSrc = VIDEO_POR_DEFECTO,
  poster,
}: {
  /** Nombre del entorno bajo el saludo (p. ej. "Portal de empresas" / "Backoffice"). */
  subtitulo: string
  /** Autentica y, si tiene éxito, navega. Si rechaza, se muestra el error. */
  onIniciarSesion: (email: string, password: string) => Promise<void>
  videoSrc?: string
  poster?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [verPassword, setVerPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  // Fuerza el muted (algunos navegadores ignoran el atributo) para permitir el autoplay.
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = true
  }, [])

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
    <main className="relative min-h-dvh overflow-hidden bg-salvia-900">
      {/* Video de marca: fondo completo en móvil/tablet; mitad izquierda en escritorio. */}
      <div className="absolute inset-y-0 left-0 right-0 lg:right-1/2">
        <video
          ref={videoRef}
          className="absolute inset-0 size-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={poster}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        {/* Velo: más oscuro en móvil (legibilidad del glass), más suave en escritorio. */}
        <div className="absolute inset-0 bg-tinta-900/55 lg:bg-tinta-900/25" aria-hidden />
        {/* Logotipo centrado sobre el video — solo escritorio (en móvil va dentro de la tarjeta). */}
        <div className="absolute inset-0 hidden items-center justify-center lg:flex">
          <LogotipoAmena className="h-14 w-auto text-primary-foreground" />
        </div>
      </div>

      {/* Contenido: en escritorio, 2 columnas (izquierda = video; derecha = formulario). */}
      <div className="relative grid min-h-dvh lg:grid-cols-2">
        <div className="hidden lg:block" aria-hidden />

        {/* Columna del formulario: sólida en escritorio; transparente sobre el video en móvil. */}
        <div className="flex items-center justify-center px-5 py-12 sm:px-8 lg:bg-background">
          {/* Tarjeta "liquid glass" en móvil/tablet; plana en escritorio. */}
          <div className="w-full max-w-sm rounded-3xl border border-border/60 bg-background/70 p-6 backdrop-blur-2xl sm:p-8 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            {/* Logo dentro de la tarjeta (en escritorio está sobre el video). */}
            <LogotipoAmena className="mb-8 h-8 w-auto text-primary lg:hidden" />

            <div className="mb-8">
              <h1 className="text-2xl font-semibold tracking-tight">Bienvenido de vuelta</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Inicia sesión para continuar · {subtitulo}
              </p>
            </div>

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

                <Field>
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <Input
                      id="password"
                      type={verPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="px-9"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setVerPassword((v) => !v)}
                      aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {verPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                </Field>

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
          </div>
        </div>
      </div>
    </main>
  )
}
