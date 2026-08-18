import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@amena/ui/components/ui/alert-dialog'
import type { Colaborador } from './api'
import { useResetearPasswordColaborador } from './queries'
import { mensajeErrorCorreo } from '@amena/supabase/correo'

/**
 * Restablece la contraseña de un colaborador: confirma la acción y le ENVÍA un correo con el
 * enlace para que defina su nueva contraseña (ya no se muestra una contraseña temporal).
 */
export function RestablecerPasswordColaborador({
  colaborador,
  onClose,
}: {
  colaborador: Colaborador
  onClose: () => void
}) {
  const resetear = useResetearPasswordColaborador()

  const confirmar = () => {
    if (!colaborador.email) {
      toast.error('Este colaborador no tiene un correo registrado para enviarle el enlace.')
      onClose()
      return
    }
    resetear.mutate(colaborador.usuario_id, {
      onSuccess: (r) => {
        onClose()
        if (r.correo_enviado) {
          toast.success(
            `Le enviamos a ${colaborador.nombre} un correo con el enlace para restablecer su contraseña.`
          )
        } else {
          // El error crudo de Postmark (inglés, jerga de proveedor) no se muestra tal cual.
          toast.error(mensajeErrorCorreo(r.correo_error, { nombre: colaborador.nombre }))
        }
      },
      onError: (e) =>
        toast.error(e instanceof Error ? e.message : 'No se pudo enviar el correo. Intenta de nuevo.'),
    })
  }

  return (
    <AlertDialog
      open
      onOpenChange={(abierto) => {
        if (!abierto) onClose()
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Enviar el enlace para restablecer la contraseña de {colaborador.nombre}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Le enviaremos un correo a{' '}
            <strong className="text-foreground">{colaborador.email ?? 'su correo'}</strong> con un
            enlace para que defina una nueva contraseña. Su contraseña actual seguirá funcionando
            hasta que la cambie.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={confirmar} loading={resetear.isPending}>
            Enviar enlace
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
