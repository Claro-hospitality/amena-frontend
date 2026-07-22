import { Copy } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@amena/ui/components/ui/button"
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@amena/ui/components/ui/dialog"

/**
 * Credenciales de acceso resultado de un alta del portal. Si se creó una cuenta nueva,
 * trae `tempPassword` (se muestra UNA sola vez). Si el email ya tenía cuenta,
 * `yaTeniaCuenta=true` y NO hay `tempPassword` (usa su contraseña actual).
 */
export interface DatosCredencialAcceso {
  email: string
  yaTeniaCuenta: boolean
  tempPassword?: string
}

/**
 * Panel reutilizable (backoffice y portal) que muestra las credenciales de acceso tras
 * dar de alta a una persona del portal, con botón para copiar. Se monta DENTRO de un
 * `DialogContent`. La contraseña temporal no se vuelve a mostrar.
 */
export function CredencialesAcceso({
  credenciales,
  onClose,
}: {
  credenciales: DatosCredencialAcceso
  onClose: () => void
}) {
  const copiar = async (texto: string, etiqueta: string) => {
    try {
      await navigator.clipboard.writeText(texto)
      toast.success(`${etiqueta} copiado`)
    } catch {
      toast.error("No se pudo copiar")
    }
  }

  // La persona ya tenía cuenta: solo se enlazó el rol, sin credenciales nuevas.
  if (credenciales.yaTeniaCuenta) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Rol asignado</DialogTitle>
          <DialogDescription>
            Ya existía una cuenta con ese correo. Se le asignó el nuevo rol y{" "}
            <strong>usa su contraseña actual</strong> — no se generan credenciales nuevas.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <CampoCredencial etiqueta="Correo" valor={credenciales.email} onCopiar={copiar} />
        </div>

        <DialogFooter className="mt-6">
          <Button onClick={onClose}>Listo</Button>
        </DialogFooter>
      </>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Acceso creado</DialogTitle>
        <DialogDescription>
          Entrega estas credenciales al usuario. La contraseña temporal{" "}
          <strong>no se vuelve a mostrar</strong>; al primer inicio de sesión deberá cambiarla.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-3">
        <CampoCredencial etiqueta="Correo" valor={credenciales.email} onCopiar={copiar} />
        {credenciales.tempPassword && (
          <CampoCredencial
            etiqueta="Contraseña temporal"
            valor={credenciales.tempPassword}
            onCopiar={copiar}
          />
        )}
      </div>

      <DialogFooter className="mt-6">
        <Button onClick={onClose}>Listo</Button>
      </DialogFooter>
    </>
  )
}

function CampoCredencial({
  etiqueta,
  valor,
  onCopiar,
}: {
  etiqueta: string
  valor: string
  onCopiar: (texto: string, etiqueta: string) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium">{etiqueta}</span>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2">
        <code className="min-w-0 flex-1 truncate font-mono text-sm">{valor}</code>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Copiar ${etiqueta.toLowerCase()}`}
          onClick={() => onCopiar(valor, etiqueta)}
        >
          <Copy className="size-4" />
        </Button>
      </div>
    </div>
  )
}
