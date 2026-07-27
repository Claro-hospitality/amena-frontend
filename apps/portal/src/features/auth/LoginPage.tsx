import { useNavigate } from 'react-router-dom'
import { PantallaAcceso } from '@amena/ui/components/pantalla-acceso'
import { useAuth } from '../../auth/useAuth'

export function LoginPage() {
  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()

  return (
    <PantallaAcceso
      subtitulo="Portal de empresas"
      onIniciarSesion={async (email, password) => {
        await iniciarSesion(email, password)
        // "/" redirige a la home según el tipo de usuario (ver InicioPorTipo).
        navigate('/', { replace: true })
      }}
    />
  )
}
