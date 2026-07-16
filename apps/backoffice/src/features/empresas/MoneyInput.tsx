import { useState } from 'react'
import { Input } from '@amena/ui/components/ui/input'
import { formatearMoneda, parsearMoneda } from '@amena/utils'

interface MoneyInputProps {
  id?: string
  name: string
  defaultValue?: number
  'aria-invalid'?: boolean
}

/** Campo de moneda MXN: muestra el monto formateado; el DOM envía el texto que el schema parsea. */
export function MoneyInput({ id, name, defaultValue, ...props }: MoneyInputProps) {
  const [texto, setTexto] = useState(defaultValue != null ? formatearMoneda(defaultValue) : '')

  return (
    <Input
      id={id}
      name={name}
      inputMode="decimal"
      placeholder="$0.00"
      value={texto}
      onChange={(e) => setTexto(e.target.value)}
      onBlur={() => {
        const monto = parsearMoneda(texto)
        setTexto(Number.isNaN(monto) ? '' : formatearMoneda(monto))
      }}
      {...props}
    />
  )
}
