import { useContadorHoy } from './queries'

/** "Hoy: N comidas" — siempre visible, en vivo (query + Realtime). */
export function ContadorHoy() {
  const { data, isLoading } = useContadorHoy()
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Hoy</span>
      <span className="text-2xl font-bold tabular-nums" aria-live="polite">
        {isLoading ? '—' : (data ?? 0)}
      </span>
      <span className="text-sm text-muted-foreground">comidas</span>
    </div>
  )
}
