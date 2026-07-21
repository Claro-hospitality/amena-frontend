import { useOutletContext } from 'react-router-dom'
import type { ContextoAcceso } from '../../auth/validarAccesoPortal'
import { MiCredencial } from '../colaborador/MiCredencialPage'

/** Inicio del panel de empresa (admin). Si el admin también es comensal, ve su QR aquí. */
export function InicioPage() {
  const { esComensal } = useOutletContext<ContextoAcceso>()

  return (
    <div className="flex flex-col gap-6">
      <p className="text-muted-foreground">Placeholder — aquí irá el panel de la empresa.</p>

      {esComensal && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">Mi credencial</h2>
          <MiCredencial />
        </section>
      )}
    </div>
  )
}
