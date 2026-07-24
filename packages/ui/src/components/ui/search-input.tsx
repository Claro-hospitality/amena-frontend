import * as React from "react"
import { Search } from "lucide-react"

import { cn } from "@amena/ui/lib/utils"
import { Input } from "@amena/ui/components/ui/input"

/**
 * Input de búsqueda estándar de las apps: campo `type="search"` con un ícono de lupa a la
 * izquierda. Úsalo en todos los buscadores para un diseño consistente. `className` controla
 * el ancho/estilo del contenedor (p. ej. `md:max-w-sm`); el resto de props van al `<input>`.
 */
function SearchInput({
  className,
  type = "search",
  ...props
}: React.ComponentProps<"input">) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input type={type} className="pl-9" {...props} />
    </div>
  )
}

export { SearchInput }
