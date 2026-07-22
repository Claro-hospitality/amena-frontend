import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@amena/ui/components/ui/alert-dialog'
import { Badge } from '@amena/ui/components/ui/badge'
import { Button } from '@amena/ui/components/ui/button'
import { Card, CardContent } from '@amena/ui/components/ui/card'
import { Field, FieldError, FieldLabel } from '@amena/ui/components/ui/field'
import { Input } from '@amena/ui/components/ui/input'
import { Label } from '@amena/ui/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@amena/ui/components/ui/radio-group'
import { Switch } from '@amena/ui/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@amena/ui/components/ui/toggle-group'
import { DIAS_HABILES_ISO, resumenPoliticaConsumo } from '@amena/utils'
import type { Empresa } from './api'
import { politicaConsumoSchema } from './empresaSchema'
import { useActualizarEmpresa } from './queries'

/** Opción de límite en el radio (personalizado usa el input). */
type OpcionLimite = '1' | '2' | 'personalizado' | 'ilimitado'

const ETIQUETA_DIA: Record<number, string> = { 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V' }
const NOMBRE_DIA: Record<number, string> = {
  1: 'lunes',
  2: 'martes',
  3: 'miércoles',
  4: 'jueves',
  5: 'viernes',
}

function opcionDesdeLimite(limite: number | null): OpcionLimite {
  if (limite === null) return 'ilimitado'
  if (limite === 1) return '1'
  if (limite === 2) return '2'
  return 'personalizado'
}

/**
 * Sección "Política de consumo" del detalle de empresa. Lectura para todos; editable
 * solo si `puedeGestionar` (super_admin). Modo libre habilita los días permitidos
 * (L-V, ISO 1..5) y el límite diario. Guardar pide confirmación por su efecto comercial.
 */
export function PoliticaConsumoSection({
  empresa,
  puedeGestionar,
}: {
  empresa: Empresa
  puedeGestionar: boolean
}) {
  const actualizar = useActualizarEmpresa()

  // Estado local del formulario (UI). La escritura va por TanStack Query al guardar.
  // Defensivo: un backend sin la migración de política (p. ej. prod aún sin liberar)
  // devuelve estos campos como undefined; se normalizan para no romper el render.
  const modoConsumo = empresa.modo_consumo ?? 'declaracion'
  const diasPermitidos = empresa.dias_permitidos ?? []
  const limiteDiarioEmpresa = empresa.limite_diario ?? null

  const [modoLibre, setModoLibre] = useState(modoConsumo === 'libre')
  const [dias, setDias] = useState<number[]>([...diasPermitidos].sort((a, b) => a - b))
  const [opcionLimite, setOpcionLimite] = useState<OpcionLimite>(
    opcionDesdeLimite(limiteDiarioEmpresa)
  )
  const [limitePersonalizado, setLimitePersonalizado] = useState(
    limiteDiarioEmpresa != null && ![1, 2].includes(limiteDiarioEmpresa)
      ? String(limiteDiarioEmpresa)
      : ''
  )
  const [errorDias, setErrorDias] = useState<string | null>(null)
  const [errorLimite, setErrorLimite] = useState<string | null>(null)
  const [confirmando, setConfirmando] = useState(false)

  const modo = modoLibre ? 'libre' : 'declaracion'

  const limiteDiario = useMemo<number | null>(() => {
    if (opcionLimite === 'ilimitado') return null
    if (opcionLimite === 'personalizado') {
      const n = Number(limitePersonalizado)
      return Number.isFinite(n) && limitePersonalizado.trim() !== '' ? n : Number.NaN
    }
    return Number(opcionLimite)
  }, [opcionLimite, limitePersonalizado])

  const sinCambios =
    modo === empresa.modo_consumo &&
    JSON.stringify(dias) === JSON.stringify([...empresa.dias_permitidos].sort((a, b) => a - b)) &&
    (Number.isNaN(limiteDiario) ? empresa.limite_diario : limiteDiario) === empresa.limite_diario

  const validar = () => {
    setErrorDias(null)
    setErrorLimite(null)
    const parsed = politicaConsumoSchema.safeParse({
      modo_consumo: modo,
      dias_permitidos: modoLibre ? dias : [],
      limite_diario: Number.isNaN(limiteDiario) ? undefined : limiteDiario,
    })
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors
      if (fe.dias_permitidos?.[0]) setErrorDias(fe.dias_permitidos[0])
      if (fe.limite_diario?.[0]) setErrorLimite(fe.limite_diario[0])
      return null
    }
    return parsed.data
  }

  const intentarGuardar = () => {
    if (validar()) setConfirmando(true)
  }

  const guardar = () => {
    const datos = validar()
    setConfirmando(false)
    if (!datos) return
    actualizar.mutate(
      { id: empresa.id, datos },
      {
        onSuccess: () => toast.success('Política de consumo actualizada'),
        onError: () => toast.error('No se pudo guardar la política. Intenta de nuevo.'),
      }
    )
  }

  const resumenLectura =
    empresa.modo_consumo === 'libre'
      ? `Consumo libre autorizado: ${resumenPoliticaConsumo(empresa.dias_permitidos, empresa.limite_diario)}`
      : 'Consumo por declaración previa (sin consumo libre).'

  return (
    <Card className="shadow-none">
      <CardContent className="flex flex-col gap-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight">Política de consumo</h2>
            {empresa.modo_consumo === 'libre' && (
              <Badge className="bg-success text-success-foreground">Consumo libre</Badge>
            )}
          </div>
        </div>

        {/* Resumen de la política vigente (siempre visible). */}
        <p className="text-sm text-muted-foreground">{resumenLectura}</p>

        {puedeGestionar && (
          <div className="flex flex-col gap-5 border-t border-border pt-5">
            {/* Modo libre */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="modo-libre">Modo libre</Label>
                <span className="text-xs text-muted-foreground">
                  Los comensales autorizados consumen sin declaración previa.
                </span>
              </div>
              <Switch
                id="modo-libre"
                checked={modoLibre}
                onCheckedChange={(v) => setModoLibre(v)}
              />
            </div>

            {modoLibre && (
              <>
                {/* Días permitidos (L-V → ISO 1..5) */}
                <Field data-invalid={errorDias ? true : undefined}>
                  <FieldLabel>Días permitidos</FieldLabel>
                  <ToggleGroup
                    aria-label="Días permitidos para consumo libre"
                    variant="outline"
                    multiple
                    value={dias.map(String)}
                    onValueChange={(vals) => {
                      setDias((vals as string[]).map(Number).sort((a, b) => a - b))
                      setErrorDias(null)
                    }}
                  >
                    {DIAS_HABILES_ISO.map((d) => (
                      <ToggleGroupItem
                        key={d}
                        value={String(d)}
                        aria-label={NOMBRE_DIA[d]}
                        className="min-w-11"
                      >
                        {ETIQUETA_DIA[d]}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  {errorDias && <FieldError>{errorDias}</FieldError>}
                </Field>

                {/* Límite diario */}
                <Field data-invalid={errorLimite ? true : undefined}>
                  <FieldLabel>Límite diario</FieldLabel>
                  <RadioGroup
                    aria-label="Límite diario de consumos"
                    value={opcionLimite}
                    onValueChange={(v) => {
                      setOpcionLimite(v as OpcionLimite)
                      setErrorLimite(null)
                    }}
                  >
                    <Label className="font-normal">
                      <RadioGroupItem value="1" /> 1 comida por día
                    </Label>
                    <Label className="font-normal">
                      <RadioGroupItem value="2" /> 2 comidas por día
                    </Label>
                    <Label className="font-normal">
                      <RadioGroupItem value="personalizado" /> Personalizado
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        aria-label="Límite personalizado de comidas por día"
                        className="ml-2 w-20"
                        value={limitePersonalizado}
                        onChange={(e) => {
                          setLimitePersonalizado(e.target.value)
                          setOpcionLimite('personalizado')
                          setErrorLimite(null)
                        }}
                      />
                    </Label>
                    <Label className="font-normal">
                      <RadioGroupItem value="ilimitado" /> Ilimitado
                    </Label>
                  </RadioGroup>
                  {errorLimite && <FieldError>{errorLimite}</FieldError>}
                </Field>
              </>
            )}

            <div className="flex justify-end">
              <Button onClick={intentarGuardar} disabled={sinCambios || actualizar.isPending}>
                {actualizar.isPending ? 'Guardando…' : 'Guardar política'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <AlertDialog
        open={confirmando}
        onOpenChange={(abierto) => {
          if (!abierto) setConfirmando(false)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Actualizar la política de consumo?</AlertDialogTitle>
            <AlertDialogDescription>
              Los comensales autorizados podrán consumir sin declaración previa; cada consumo se
              cobra en el cierre.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={guardar}>Guardar cambios</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
