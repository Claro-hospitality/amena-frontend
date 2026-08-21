import { useRef, useState, type ChangeEvent } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { validarImagen } from '@amena/utils'
import { AspectRatio } from '@amena/ui/components/ui/aspect-ratio'
import { Button } from '@amena/ui/components/ui/button'
import { esImagenPropia } from './imagenEvento'

/**
 * Campo de imagen destacada del evento. Hace el preview local y la validación de tipo/tamaño;
 * la subida real a Storage la hace el submit del formulario.
 *
 * El archivo elegido sube al formulario por `onCambio` (`null` = la quitó), no por el FormData:
 * un `<input type="file">` no viaja en el `FormData` que arma jsdom, así que hacerlo por estado
 * es además lo único testeable sin un navegador de verdad.
 *
 * Un evento con la imagen por omisión se muestra como "sin imagen": es justo lo que la regla de
 * publicación considera que le falta, así que enseñarla como si fuera suya engañaría.
 */
export function ImagenEventoUploader({
  imagenActual,
  error,
  onCambio,
}: {
  imagenActual: string | null
  error?: string | null
  /** Imagen elegida, o `null` si la quitó. */
  onCambio: (file: File | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(
    esImagenPropia(imagenActual) ? imagenActual : null
  )
  const [errorLocal, setErrorLocal] = useState<string | null>(null)

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validarImagen(file)
    if (err) {
      setErrorLocal(err)
      e.target.value = ''
      return
    }
    setErrorLocal(null)
    setPreview(URL.createObjectURL(file))
    onCambio(file)
  }

  function quitar() {
    setPreview(null)
    setErrorLocal(null)
    if (inputRef.current) inputRef.current.value = ''
    onCambio(null)
  }

  const mensaje = errorLocal ?? error

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-semibold">Imagen destacada</h2>

      <div className="mt-3">
        <AspectRatio
          ratio={3 / 2}
          className="overflow-hidden rounded-xl border border-border bg-muted"
        >
          {preview ? (
            <img src={preview} alt="Vista previa de la imagen del evento" className="size-full object-cover" />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-6 text-center">
              <ImagePlus className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium">Sin imagen</p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG o WebP · máx. 5 MB · 1200×800 px recomendado
              </p>
            </div>
          )}
        </AspectRatio>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onFile}
          className="hidden"
          aria-label="Imagen destacada del evento"
        />
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <ImagePlus className="size-4" />
          {preview ? 'Cambiar imagen' : 'Subir imagen'}
        </Button>
        {preview && (
          <Button type="button" variant="ghost" size="sm" onClick={quitar}>
            <X className="size-4" />
            Quitar
          </Button>
        )}
      </div>

      {mensaje && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {mensaje}
        </p>
      )}
    </section>
  )
}
