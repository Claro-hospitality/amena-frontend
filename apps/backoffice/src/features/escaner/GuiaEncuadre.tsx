/** Guía visual de encuadre: un recuadro con esquinas para centrar el QR. */
export function GuiaEncuadre() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative aspect-square w-3/5 max-w-72">
        <span className="absolute left-0 top-0 size-10 rounded-tl-xl border-l-4 border-t-4 border-primary" />
        <span className="absolute right-0 top-0 size-10 rounded-tr-xl border-r-4 border-t-4 border-primary" />
        <span className="absolute bottom-0 left-0 size-10 rounded-bl-xl border-b-4 border-l-4 border-primary" />
        <span className="absolute bottom-0 right-0 size-10 rounded-br-xl border-b-4 border-r-4 border-primary" />
      </div>
    </div>
  )
}
