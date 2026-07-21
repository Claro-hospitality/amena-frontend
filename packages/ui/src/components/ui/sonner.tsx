import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

// Entrada del toast: aparece con un fundido EN SU POSICIÓN, sin deslizarse desde
// ningún borde. Sonner arranca la entrada en `translateY(-100%)` (viene de
// arriba); aquí neutralizamos ese desplazamiento inicial dejando el toast ya en
// su sitio (`--y: translateY(0)`), de modo que solo anime la opacidad (sonner ya
// la transiciona a 400ms). Se scopea al estado NO montado para no afectar el
// apilamiento de varios toasts ni la animación de salida.
const toasterAnimationCss = `
  [data-sonner-toaster] [data-sonner-toast]:not([data-mounted='true']) {
    --y: translateY(0) !important;
  }
`

const Toaster = ({ ...props }: ToasterProps) => {
  // El modo oscuro no está cableado en las apps: se fuerza tema claro para que
  // los toasts no hereden el modo del SO ("system") y rompan el diseño.
  return (
    <>
    <style>{toasterAnimationCss}</style>
    <Sonner
      theme="light"
      position="top-center"
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          // Base común: superficie sólida, esquinas suaves de marca.
          // `!` (important) porque sonner colorea el toast, título e ícono con
          // selectores de especificidad más alta que las clases utilitarias.
          toast:
            "cn-toast group flex w-full items-start gap-2.5 rounded-2xl border border-transparent px-4 py-3 text-sm",
          title: "font-medium text-current!",
          description: "text-current/90!",
          icon: "mt-0.5 size-4 shrink-0 text-current!",
          // Variantes de estado: fondo sólido del color del estado + texto/ícono
          // en su color de contraste (token `-foreground`, blanco donde aplica).
          default: "bg-card! text-card-foreground! border-border!",
          success: "bg-success! text-success-foreground!",
          info: "bg-info! text-info-foreground!",
          warning: "bg-warning! text-warning-foreground!",
          error: "bg-destructive! text-destructive-foreground!",
        },
      }}
      {...props}
    />
    </>
  )
}

export { Toaster }
