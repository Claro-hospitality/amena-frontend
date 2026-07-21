#!/usr/bin/env bash
#
# dev-lan.sh — levanta el dev server exponiéndolo en la red local (LAN)
# y apunta el cliente de Supabase a la IP de esta máquina en vez de localhost.
#
# Uso:
#   ./scripts/dev-lan.sh                # ambas apps
#   ./scripts/dev-lan.sh portal         # solo portal
#   ./scripts/dev-lan.sh backoffice     # solo backoffice
#
# Por qué: desde un dispositivo externo (teléfono/tablet), "localhost" apunta
# a ESE dispositivo, no a la Mac. Hay que usar la IP LAN de la Mac para que
# el login y las llamadas a Supabase lleguen al stack local.

set -euo pipefail

# Puerto de la API de Supabase local (Kong). Override: SUPABASE_PORT=xxxx ./scripts/dev-lan.sh
SUPABASE_PORT="${SUPABASE_PORT:-54331}"

# --- Detectar la IP LAN de la Mac (interfaz activa) ---
detect_ip() {
  local ip=""
  # Interfaces típicas de Wi-Fi/Ethernet
  for iface in en0 en1 en2; do
    ip="$(ipconfig getifaddr "$iface" 2>/dev/null || true)"
    [ -n "$ip" ] && { echo "$ip"; return 0; }
  done
  # Fallback: interfaz de la ruta por defecto
  local def_iface
  def_iface="$(route -n get default 2>/dev/null | awk '/interface:/{print $2}')"
  if [ -n "${def_iface:-}" ]; then
    ip="$(ipconfig getifaddr "$def_iface" 2>/dev/null || true)"
    [ -n "$ip" ] && { echo "$ip"; return 0; }
  fi
  return 1
}

IP="$(detect_ip || true)"
if [ -z "${IP:-}" ]; then
  echo "✖ No pude detectar la IP LAN. ¿Estás conectado a una red Wi-Fi/Ethernet?" >&2
  exit 1
fi

# Inyecta la URL de Supabase apuntando a la IP LAN. Vite da prioridad a las
# variables del entorno sobre las de .env.local, así que esto sobrescribe
# localhost solo para esta corrida (no toca ningún archivo).
export VITE_SUPABASE_URL="http://${IP}:${SUPABASE_PORT}"

# --- Mapear argumento a filtro de turbo ---
FILTER=""
case "${1:-}" in
  portal)     FILTER="--filter=portal" ;;
  backoffice) FILTER="--filter=backoffice" ;;
  "")         FILTER="" ;;
  *) echo "✖ Argumento no reconocido: '$1' (usa: portal | backoffice, o nada para ambas)" >&2; exit 1 ;;
esac

echo "▶ Supabase → $VITE_SUPABASE_URL"
echo "▶ Abre en tu dispositivo (misma red Wi-Fi):"
[ "${1:-}" != "backoffice" ] && echo "    portal      → http://${IP}:5173"
[ "${1:-}" != "portal" ]     && echo "    backoffice  → http://${IP}:5174"
echo ""

# turbo dev es persistente; exec para que Ctrl-C lo corte limpio
exec pnpm exec turbo dev $FILTER
