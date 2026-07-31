import { useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { driver, type Driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import './recorrido.css'
import { construirPasos } from './recorridoPasos'
import type { TipoUsuarioPortal } from '../../auth/validarAccesoPortal'

const CLAVE_PENDIENTE = 'amena.portal.recorrido.pendiente'

/**
 * Programa el recorrido para que se muestre automáticamente en el próximo acceso
 * al portal. Se llama justo después de que el usuario define su contraseña por
 * primera vez (enlace del correo de bienvenida o cambio obligatorio).
 */
export function programarRecorrido() {
  try {
    localStorage.setItem(CLAVE_PENDIENTE, '1')
  } catch {
    /* modo privado / sin storage: se omite el auto-inicio */
  }
}

/**
 * Devuelve `true` una sola vez si el recorrido estaba programado, y lo limpia
 * (consumo atómico) para que no vuelva a auto-iniciarse.
 */
export function consumirRecorridoPendiente(): boolean {
  try {
    if (localStorage.getItem(CLAVE_PENDIENTE) === '1') {
      localStorage.removeItem(CLAVE_PENDIENTE)
      return true
    }
  } catch {
    /* sin storage: nunca hay pendiente */
  }
  return false
}

/** De entre los elementos que casan el selector, el primero realmente visible. */
function elementoVisible(selector: string): HTMLElement | null {
  const els = Array.from(document.querySelectorAll<HTMLElement>(selector))
  return els.find((el) => el.offsetParent !== null) ?? els[0] ?? null
}

/** Espera (con timeout) a que el elemento exista y sea visible tras navegar. */
function esperarElemento(selector: string, timeout = 3000): Promise<HTMLElement | null> {
  const inmediato = elementoVisible(selector)
  if (inmediato) return Promise.resolve(inmediato)
  return new Promise((resolve) => {
    const inicio = performance.now()
    const id = window.setInterval(() => {
      const el = elementoVisible(selector)
      if (el || performance.now() - inicio > timeout) {
        window.clearInterval(id)
        resolve(el)
      }
    }, 60)
  })
}

/**
 * Recorrido guiado del portal con driver.js. Navega por cada sección según el
 * rol (el admin entra a Empresa y recorre sus sub-secciones) y resalta el punto
 * de navegación correspondiente. Devuelve `iniciar()` para dispararlo (auto en
 * el primer acceso o manualmente desde el menú de usuario).
 */
export function useRecorridoPortal(tipo: TipoUsuarioPortal) {
  const navigate = useNavigate()
  const driverRef = useRef<Driver | null>(null)

  const iniciar = useCallback(() => {
    // Evita dos recorridos simultáneos.
    if (driverRef.current) return

    const pasos = construirPasos(tipo)
    const total = pasos.length

    const d = driver({
      allowClose: true,
      overlayColor: 'rgba(43, 41, 37, 0.6)',
      stagePadding: 6,
      stageRadius: 12,
      popoverClass: 'amena-recorrido',
      onDestroyed: () => {
        driverRef.current = null
      },
    })
    driverRef.current = d

    const mostrar = async (i: number) => {
      const paso = pasos[i]
      window.scrollTo({ top: 0, behavior: 'auto' })
      if (paso.ruta) navigate(paso.ruta)

      const el = paso.ancla ? await esperarElemento(paso.ancla) : null
      // El usuario pudo cerrar el recorrido mientras esperábamos al elemento.
      if (driverRef.current !== d) return

      const esUltimo = i === total - 1
      const esPrimero = i === 0

      const popover = {
        title: paso.titulo,
        description: `${paso.descripcion}<div class="amena-recorrido-progreso">Paso ${i + 1} de ${total}</div>`,
        showButtons: ['next', 'previous', 'close'] as ('next' | 'previous' | 'close')[],
        disableButtons: (esPrimero ? ['previous'] : []) as ('next' | 'previous' | 'close')[],
        nextBtnText: esUltimo ? 'Terminar' : 'Siguiente',
        prevBtnText: 'Atrás',
        onNextClick: () => {
          if (esUltimo) d.destroy()
          else void mostrar(i + 1)
        },
        onPrevClick: () => {
          if (!esPrimero) void mostrar(i - 1)
        },
        onCloseClick: () => d.destroy(),
      }

      if (el) d.highlight({ element: el, popover })
      else d.highlight({ popover })
    }

    void mostrar(0)
  }, [navigate, tipo])

  return { iniciar }
}
