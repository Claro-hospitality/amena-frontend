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
          // Base común: superficie con borde, esquinas suaves de marca, texto legible.
          toast:
            "cn-toast group flex w-full items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm",
          title: "font-medium text-card-foreground",
          description: "text-muted-foreground",
          icon: "mt-0.5 size-4 shrink-0",
          // Variantes de estado alineadas a los tokens de marca y al componente Alert:
          // fondo tenue + borde del color + ícono coloreado, texto siempre legible.
          default: "bg-card text-card-foreground border-border",
          success:
            "border-success/30 bg-success/10 text-card-foreground [&_[data-icon]]:text-success",
          info: "border-info/30 bg-info/10 text-card-foreground [&_[data-icon]]:text-info",
          warning:
            "border-warning/40 bg-warning/10 text-card-foreground [&_[data-icon]]:text-warning",
          error:
            "border-destructive/30 bg-destructive/10 text-card-foreground [&_[data-icon]]:text-destructive",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
