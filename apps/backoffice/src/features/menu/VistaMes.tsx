import { aISO, diasHabiles, rangoSemanaLegible } from '@amena/utils'
import type { MenuDiaConPlatillo } from './api'
import { DiaColumna } from './DiaColumna'
import type { Platillo } from '../platillos/api'

/**
 * Vista "Mes": las semanas del mes apiladas, cada una con su rango y su grilla de
 * días hábiles (lun–vie) para agregar/quitar platillos. Reusa DiaColumna.
 */
export function VistaMes({
  semanas,
  menu,
  activos,
  onAgregar,
  onQuitar,
}: {
  semanas: Date[]
  menu: MenuDiaConPlatillo[]
  activos: Platillo[]
  onAgregar: (fechaISO: string, platilloId: number) => void
  onQuitar: (id: number) => void
}) {
  const asignadosDe = (fechaISO: string) => menu.filter((m) => m.fecha === fechaISO)

  return (
    <div className="flex flex-col gap-6">
      {semanas.map((lunes) => (
        <section key={aISO(lunes)} className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Semana {rangoSemanaLegible(lunes)}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {diasHabiles(lunes).map((dia) => {
              const fechaISO = aISO(dia)
              return (
                <DiaColumna
                  key={fechaISO}
                  fecha={dia}
                  asignados={asignadosDe(fechaISO)}
                  activos={activos}
                  onAgregar={onAgregar}
                  onQuitar={onQuitar}
                />
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
