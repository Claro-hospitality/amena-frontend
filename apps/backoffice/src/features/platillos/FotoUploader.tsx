import { useRef, useState, type ChangeEvent } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { AspectRatio } from '@amena/ui/components/ui/aspect-ratio'
import { Button } from '@amena/ui/components/ui/button'
import { validarImagen } from './foto'
import { PlaceholderFoto } from './PlaceholderFoto'

/**
 * Campo de foto: preview local + validación de tipo/tamaño. La subida real a Storage la hace
 * el submit del formulario (lee `foto` y `quitar_foto` del FormData).
 */
export function FotoUploader({ fotoActual }: { fotoActual: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(fotoActual)
  const [quitando, setQuitando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validarImagen(file)
    if (err) {
      setError(err)
      e.target.value = ''
      return
    }
    setError(null)
    setQuitando(false)
    setPreview(URL.createObjectURL(file))
  }

  function quitar() {
    setPreview(null)
    setQuitando(true)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="w-44">
        <AspectRatio
          ratio={16 / 9}
          className="overflow-hidden rounded-lg border border-border bg-muted"
        >
          {preview ? (
            <img src={preview} alt="Vista previa" className="size-full object-cover" />
          ) : (
            <PlaceholderFoto />
          )}
        </AspectRatio>
      </div>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          name="foto"
          accept="image/jpeg,image/png,image/webp"
          onChange={onFile}
          className="hidden"
        />
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <ImagePlus className="size-4" />
          {preview ? 'Cambiar foto' : 'Subir foto'}
        </Button>
        {preview && (
          <Button type="button" variant="ghost" size="sm" onClick={quitar}>
            <X className="size-4" />
            Quitar
          </Button>
        )}
        <input type="hidden" name="quitar_foto" value={quitando ? '1' : ''} />
      </div>
      <p className="text-xs text-muted-foreground">JPG, PNG o WebP · máx. 5 MB</p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
