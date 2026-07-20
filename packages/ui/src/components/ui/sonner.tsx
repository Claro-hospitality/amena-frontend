import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  // El modo oscuro no está cableado en las apps: se fuerza tema claro para que
  // los toasts no hereden el modo del SO ("system") y rompan el diseño.
  return (
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
          // Base común: superficie sólida, esquinas suaves de marca. El color de
          // texto/ícono lo hereda `text-*` de cada variante (via currentColor).
          toast:
            "cn-toast group flex w-full items-start gap-2.5 rounded-2xl border border-transparent px-4 py-3 text-sm",
          title: "font-medium text-current",
          description: "text-current/90",
          icon: "mt-0.5 size-4 shrink-0 text-current",
          // Variantes de estado: fondo sólido del color del estado + texto/ícono
          // en su color de contraste (token `-foreground`, blanco donde aplica).
          default: "bg-card text-card-foreground border-border",
          success: "bg-success text-success-foreground",
          info: "bg-info text-info-foreground",
          warning: "bg-warning text-warning-foreground",
          error: "bg-destructive text-destructive-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
