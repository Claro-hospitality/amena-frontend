import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"

import { cn } from "@amena/ui/lib/utils"
import { Button } from "@amena/ui/components/ui/button"
import { Field, FieldError, FieldLabel } from "@amena/ui/components/ui/field"
import { Input } from "@amena/ui/components/ui/input"
import { LogotipoAmena } from "@amena/ui/components/logotipo-amena"

const VIDEO_POR_DEFECTO = "/videos/general-amena.mp4"

/**
 * Marco visual de las pantallas de acceso (login, definir contraseña, etc.). Presentacional.
 *
 * Layout responsivo con el video de marca de fondo:
 *  - Escritorio (lg+): split — video a la IZQUIERDA (logotipo centrado encima) y el contenido a la
 *    derecha sobre un panel sólido (crema), más grande.
 *  - Móvil / tablet: el video ocupa TODO el fondo (más oscuro) y el contenido va encima en una
 *    tarjeta translúcida tipo "liquid glass" (blur), con el logo dentro.
 */
export function MarcoAcceso({
  children,
  videoSrc = VIDEO_POR_DEFECTO,
  poster,
}: {
  children: ReactNode
  videoSrc?: string
  poster?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Fuerza el muted (algunos navegadores ignoran el atributo) para permitir el autoplay.
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = true
  }, [])

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
          <LogotipoAmena className="h-24 w-auto text-primary-foreground xl:h-28" />
        </div>
      </div>

      {/* Contenido: en escritorio, 2 columnas (izquierda = video; derecha = contenido). */}
      <div className="relative grid min-h-dvh lg:grid-cols-2">
        <div className="hidden lg:block" aria-hidden />

        <div className="flex items-center justify-center px-5 py-12 sm:px-8 lg:bg-background">
          {/* Tarjeta "liquid glass" en móvil/tablet; plana en escritorio. */}
          <div className="w-full max-w-sm rounded-3xl border border-border/60 bg-background/70 p-6 backdrop-blur-2xl sm:p-8 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            {/* Logo dentro de la tarjeta (en escritorio está sobre el video). */}
            <LogotipoAmena className="mb-8 h-8 w-auto text-primary lg:hidden" />
            {children}
          </div>
        </div>
      </div>
    </main>
  )
}

/** Encabezado estándar (título + subtítulo) de las pantallas de acceso. */
export function EncabezadoAcceso({
  titulo,
  subtitulo,
}: {
  titulo: string
  subtitulo?: ReactNode
}) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold tracking-tight text-balance">{titulo}</h1>
      {subtitulo && <p className="mt-1.5 text-sm text-muted-foreground">{subtitulo}</p>}
    </div>
  )
}

/**
 * Autoservicio para cuando el enlace del correo venció o ya se usó: la persona pide otro sin
 * tener que escribirle a un administrador. Presentacional — el envío entra por `onEnviar`.
 *
 * `onEnviar` devuelve el mensaje a mostrar. Es el MISMO exista o no la cuenta (así lo responde
 * la edge function, a propósito), así que aquí no se distingue "enviado" de "no existe": se
 * muestra el mensaje tal cual y se oculta el formulario para no invitar a reintentar en bucle.
 */
export function SolicitarEnlaceAcceso({
  onEnviar,
}: {
  onEnviar: (email: string) => Promise<string>
}) {
  const [estado, accion, pendiente] = useActionState<
    { mensaje?: string; error?: string },
    FormData
  >(async (_previo, datos) => {
    const email = String(datos.get("email") ?? "").trim()
    if (!email) return { error: "Escribe tu correo para enviarte el enlace." }
    try {
      return { mensaje: await onEnviar(email) }
    } catch {
      return {
        error: "No pudimos enviar el enlace. Inténtalo de nuevo en un momento.",
      }
    }
  }, {})

  if (estado.mensaje) {
    return (
      <p
        role="status"
        className="rounded-lg bg-success/10 px-3 py-2 text-sm text-foreground"
      >
        {estado.mensaje}
      </p>
    )
  }

  return (
    <form action={accion} className="flex flex-col gap-4">
      <Field>
        <FieldLabel htmlFor="email-enlace">Tu correo</FieldLabel>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="email-enlace"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            className="px-9"
            aria-invalid={Boolean(estado.error)}
          />
        </div>
        {estado.error && (
          <FieldError role="alert">{estado.error}</FieldError>
        )}
      </Field>

      <Button type="submit" size="lg" className="w-full" loading={pendiente}>
        Enviarme un enlace nuevo
      </Button>
    </form>
  )
}

/**
 * Campo de contraseña con icono de candado y botón mostrar/ocultar. Acepta las props de un input
 * (controlado o por `name`); el `type` lo maneja internamente el toggle.
 */
export function CampoPassword({
  label,
  id,
  className,
  ...props
}: { label: string } & Omit<ComponentProps<typeof Input>, "type">) {
  const [ver, setVer] = useState(false)
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <Lock
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id={id}
          type={ver ? "text" : "password"}
          className={cn("px-9", className)}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
          onClick={() => setVer((v) => !v)}
          aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {ver ? <EyeOff /> : <Eye />}
        </Button>
      </div>
    </Field>
  )
}
