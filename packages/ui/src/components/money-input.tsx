import { useState, type ComponentProps } from 'react'
import { formatearMoneda, parsearMoneda } from '@amena/utils'
import { Input } from '@amena/ui/components/ui/input'

type MoneyInputProps = Omit<ComponentProps<typeof Input>, 'value' | 'defaultValue' | 'type'> & {
  /** Monto inicial (número). Se muestra formateado como moneda MXN. */
  defaultValue?: number
}

/**
 * Campo de moneda MXN estandarizado. Muestra el monto formateado ("$1,234.50");
 * el DOM envía el texto crudo que el schema (zod) parsea con `parsearMoneda`.
 * Formateo siempre vía `@amena/utils` — nunca inline.
 */
export function MoneyInput({ defaultValue, ...props }: MoneyInputProps) {
  const [texto, setTexto] = useState(defaultValue != null ? formatearMoneda(defaultValue) : '')

  return (
    <Input
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
