import { useState } from 'react'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@amena/ui/components/ui/combobox'
import type { Platillo } from '../platillos/api'

/** Combobox con búsqueda para agregar un platillo (solo los disponibles). Se reinicia al elegir. */
export function SelectorPlatillo({
  opciones,
  onAgregar,
}: {
  opciones: Platillo[]
  onAgregar: (platilloId: string) => void
}) {
  const [instancia, setInstancia] = useState(0)

  return (
    <Combobox
      key={instancia}
      items={opciones}
      itemToStringLabel={(p: Platillo) => p.nombre}
      onValueChange={(p: Platillo | null) => {
        if (p) {
          onAgregar(p.id)
          setInstancia((n) => n + 1)
        }
      }}
    >
      <ComboboxInput placeholder="Agregar platillo…" />
      <ComboboxContent>
        <ComboboxEmpty>Sin platillos disponibles</ComboboxEmpty>
        <ComboboxList>
          {(p: Platillo) => (
            <ComboboxItem key={p.id} value={p}>
              {p.nombre}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
