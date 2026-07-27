import { useEffect, useRef, useState, type FormEvent } from "react"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"

import { cn } from "@amena/ui/lib/utils"
import { Button } from "@amena/ui/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@amena/ui/components/ui/field"
import { Input } from "@amena/ui/components/ui/input"
import { LogotipoAmena } from "@amena/ui/components/logotipo-amena"

const VIDEO_POR_DEFECTO = "/videos/general-amena.mp4"

/** ¿Viewport de escritorio (lg+)? Evita descargar el video de fondo en móvil. */
function useEsEscritorio() {
  const [esEscritorio, setEsEscritorio] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches
  )
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    const on = () => setEsEscritorio(mq.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  return esEscritorio
}

/**
 * Pantalla de acceso (login) compartida por backoffice y portal. Presentacional: la autenticación
 * se inyecta con `onIniciarSesion` (que además navega al éxito). Layout split — video a la izquierda
 * con el logotipo encima, formulario a la derecha. En móvil solo se ve el formulario (con el logo);
 * el video no se monta para no descargarlo.
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
  const esEscritorio = useEsEscritorio()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [verPassword, setVerPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  // Fuerza el muted (algunos navegadores ignoran el atributo) para permitir el autoplay.
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = true
  }, [esEscritorio])

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
    <main className="grid min-h-dvh bg-background lg:grid-cols-[1.05fr_1fr]">
      {/* Panel izquierdo: video de marca (solo escritorio) con el logotipo encima. */}
      <div className="relative hidden overflow-hidden bg-salvia-900 lg:block">
        {esEscritorio && (
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
        )}
        {/* Velo sólido para dar legibilidad al logotipo sobre el video. */}
        <div className="absolute inset-0 bg-tinta-900/30" aria-hidden />
        <LogotipoAmena className="absolute left-10 top-9 h-8 w-auto text-primary-foreground" />
      </div>

      {/* Panel derecho: formulario. */}
      <div className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          {/* Logo en móvil (en escritorio va sobre el video). */}
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
    </main>
  )
}
