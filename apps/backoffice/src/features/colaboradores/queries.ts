import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  altaUsuarioPortal,
  asignarRolUnico,
  eliminarUsuarioPortal,
  establecerComidaComensal,
  establecerConsumoLibre,
  establecerEstadoPortal,
  establecerRolPortal,
  listarColaboradores,
  listarUsuariosEmpresa,
  restablecerAccesoPortal,
  type DatosAlta,
  type RolPortal,
} from './api'

export function useColaboradores() {
  return useQuery({ queryKey: ['colaboradores', 'backoffice'], queryFn: listarColaboradores })
}

/** Todos los usuarios del portal (admins + colaboradores) de una empresa. */
export function useUsuariosEmpresa(empresaId: number) {
  return useQuery({
    queryKey: ['usuarios', 'empresa', empresaId],
    queryFn: () => listarUsuariosEmpresa(empresaId),
  })
}

/** Agrega/quita un rol a un usuario del portal; refresca el listado y el resumen. */
export function useEstablecerRol() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      usuarioId,
      rol,
      activo,
    }: {
      usuarioId: number
      rol: RolPortal
      activo: boolean
    }) => establecerRolPortal(usuarioId, rol, activo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usuarios'] })
      qc.invalidateQueries({ queryKey: ['empresa'] })
    },
  })
}

/** Fija el rol único (admin XOR colaborador) de un usuario; refresca listado y resumen. */
export function useAsignarRolUnico() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ usuarioId, rol }: { usuarioId: number; rol: RolPortal }) =>
      asignarRolUnico(usuarioId, rol),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usuarios'] })
      qc.invalidateQueries({ queryKey: ['empresa'] })
    },
  })
}

/** Da de baja/alta la comida de un comensal; refresca el listado y el resumen. */
export function useEstablecerComida() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ usuarioId, activo }: { usuarioId: number; activo: boolean }) =>
      establecerComidaComensal(usuarioId, activo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usuarios'] })
      qc.invalidateQueries({ queryKey: ['empresa'] })
    },
  })
}

/** Activa/desactiva el consumo libre de un usuario (comensal); refresca listado y resumen. */
export function useEstablecerConsumoLibre() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ usuarioId, activo }: { usuarioId: number; activo: boolean }) =>
      establecerConsumoLibre(usuarioId, activo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usuarios'] })
      qc.invalidateQueries({ queryKey: ['empresa'] })
    },
  })
}

export function useAltaUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (datos: DatosAlta) => altaUsuarioPortal(datos),
    onSuccess: () => {
      // Refresca el listado de usuarios de la empresa y el resumen (cuenta de activos).
      qc.invalidateQueries({ queryKey: ['usuarios'] })
      qc.invalidateQueries({ queryKey: ['empresa'] })
    },
  })
}

/** Envía por correo el enlace para que un usuario del portal restablezca su contraseña. */
export function useRestablecerAccesoPortal() {
  return useMutation({
    mutationFn: (email: string) => restablecerAccesoPortal(email),
  })
}

/** Activa/desactiva el ACCESO (login) de un usuario del portal; refresca listado y resumen. */
export function useEstablecerEstadoPortal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ usuarioId, activo }: { usuarioId: number; activo: boolean }) =>
      establecerEstadoPortal(usuarioId, activo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usuarios'] })
      qc.invalidateQueries({ queryKey: ['empresa'] })
    },
  })
}

/** Borrado lógico de un usuario del portal (requiere acceso desactivado); refresca listados. */
export function useEliminarUsuarioPortal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (usuarioId: number) => eliminarUsuarioPortal(usuarioId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usuarios'] })
      qc.invalidateQueries({ queryKey: ['empresa'] })
      qc.invalidateQueries({ queryKey: ['colaboradores'] })
    },
  })
}
