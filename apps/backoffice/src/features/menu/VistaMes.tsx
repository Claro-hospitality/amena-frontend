import { useState } from 'react'
import { aISO, diasDeSemana } from '@amena/utils'
import type { MenuDiaConPlatillo } from './api'
import { DiaCeldaMes } from './DiaCeldaMes'
import { DiaMenuPanel } from './DiaMenuPanel'
import type { Platillo } from '../platillos/api'

/** Encabezados de columna del calendario (lun–dom). */
const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

/**
 * Vista "Mes": calendario en cuadrícula (7 columnas, lun–dom) con todos los días del
 * mes. Cada día hábil muestra sus platillos (y "+N más" si exceden); al hacer clic se
 * abre el diálogo del día para ver/gestionar el menú completo. Reusa el rango ya cargado.
 */
export function VistaMes({
  mes,
  semanas,
  menu,
  activos,
  onAgregar,
  onQuitar,
  soloLectura = false,
}: {
  /** Cualquier fecha dentro del mes mostrado (para atenuar los días de otros meses). */
  mes: Date
  /** Lunes de cada semana que compone el mes. */
  semanas: Date[]
  menu: MenuDiaConPlatillo[]
  activos: Platillo[]
  onAgregar: (fechaISO: string, platilloId: number) => void
  onQuitar: (id: number) => void
  /** Rol sin permiso de edición (p. ej. consulta): el panel del día es de solo lectura. */
  soloLectura?: boolean
}) {
  const [abiertoISO, setAbiertoISO] = useState<string | null>(null)

  const asignadosDe = (fechaISO: string) => menu.filter((m) => m.fecha === fechaISO)
  const esDelMes = (dia: Date) =>
    dia.getMonth() === mes.getMonth() && dia.getFullYear() === mes.getFullYear()

  const diaAbierto = abiertoISO
    ? semanas.flatMap(diasDeSemana).find((d) => aISO(d) === abiertoISO)
    : null

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">
        {/* Encabezado de columnas */}
        <div className="mb-2 grid grid-cols-7 gap-2">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="px-1 text-xs font-semibold tracking-wide text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        {/* Semanas del mes */}
        <div className="flex flex-col gap-2">
          {semanas.map((lunes) => (
            <div key={aISO(lunes)} className="grid grid-cols-7 gap-2">
              {diasDeSemana(lunes).map((dia) => {
                const fechaISO = aISO(dia)
                return (
                  <DiaCeldaMes
                    key={fechaISO}
                    fecha={dia}
                    esDelMes={esDelMes(dia)}
                    asignados={asignadosDe(fechaISO)}
                    onAbrir={() => setAbiertoISO(fechaISO)}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {diaAbierto && abiertoISO && (
        <DiaMenuPanel
          fecha={diaAbierto}
          asignados={asignadosDe(abiertoISO)}
          activos={activos}
          onAgregar={onAgregar}
          onQuitar={onQuitar}
          onClose={() => setAbiertoISO(null)}
          soloLectura={soloLectura}
        />
      )}
    </div>
  )
}
