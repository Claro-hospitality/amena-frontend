// Catálogos oficiales del SAT usados en los datos fiscales de una empresa. Son regla de
// negocio compartida entre apps (backoffice y portal) → viven en @amena/utils, junto al
// schema fiscal (fiscal.ts). Se llenan como <Select> en los formularios de datos fiscales.

/** Una opción de un catálogo del SAT: su clave y la descripción oficial. */
export interface OpcionCatalogoSat {
  codigo: string
  descripcion: string
}

/**
 * Régimen fiscal — catálogo SAT `c_RegimenFiscal` (vigente CFDI 4.0). Incluye claves de
 * persona física y moral; el usuario elige la que corresponda a la empresa.
 */
export const REGIMENES_FISCALES: readonly OpcionCatalogoSat[] = [
  { codigo: '601', descripcion: 'General de Ley Personas Morales' },
  { codigo: '603', descripcion: 'Personas Morales con Fines no Lucrativos' },
  { codigo: '605', descripcion: 'Sueldos y Salarios e Ingresos Asimilados a Salarios' },
  { codigo: '606', descripcion: 'Arrendamiento' },
  { codigo: '607', descripcion: 'Régimen de Enajenación o Adquisición de Bienes' },
  { codigo: '608', descripcion: 'Demás ingresos' },
  { codigo: '609', descripcion: 'Consolidación' },
  {
    codigo: '610',
    descripcion: 'Residentes en el Extranjero sin Establecimiento Permanente en México',
  },
  { codigo: '611', descripcion: 'Ingresos por Dividendos (socios y accionistas)' },
  { codigo: '612', descripcion: 'Personas Físicas con Actividades Empresariales y Profesionales' },
  { codigo: '614', descripcion: 'Ingresos por intereses' },
  { codigo: '615', descripcion: 'Régimen de los ingresos por obtención de premios' },
  { codigo: '616', descripcion: 'Sin obligaciones fiscales' },
  {
    codigo: '620',
    descripcion: 'Sociedades Cooperativas de Producción que optan por diferir sus ingresos',
  },
  { codigo: '621', descripcion: 'Incorporación Fiscal' },
  { codigo: '622', descripcion: 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras' },
  { codigo: '623', descripcion: 'Opcional para Grupos de Sociedades' },
  { codigo: '624', descripcion: 'Coordinados' },
  {
    codigo: '625',
    descripcion:
      'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas',
  },
  { codigo: '626', descripcion: 'Régimen Simplificado de Confianza' },
  { codigo: '628', descripcion: 'Hidrocarburos' },
  {
    codigo: '629',
    descripcion: 'De los Regímenes Fiscales Preferentes y de las Empresas Multinacionales',
  },
  { codigo: '630', descripcion: 'Enajenación de acciones en bolsa de valores' },
]

/** Uso de CFDI — catálogo SAT `c_UsoCFDI` (vigente CFDI 4.0). */
export const USOS_CFDI: readonly OpcionCatalogoSat[] = [
  { codigo: 'G01', descripcion: 'Adquisición de mercancías' },
  { codigo: 'G02', descripcion: 'Devoluciones, descuentos o bonificaciones' },
  { codigo: 'G03', descripcion: 'Gastos en general' },
  { codigo: 'I01', descripcion: 'Construcciones' },
  { codigo: 'I02', descripcion: 'Mobiliario y equipo de oficina por inversiones' },
  { codigo: 'I03', descripcion: 'Equipo de transporte' },
  { codigo: 'I04', descripcion: 'Equipo de cómputo y accesorios' },
  { codigo: 'I05', descripcion: 'Dados, troqueles, moldes, matrices y herramental' },
  { codigo: 'I06', descripcion: 'Comunicaciones telefónicas' },
  { codigo: 'I07', descripcion: 'Comunicaciones satelitales' },
  { codigo: 'I08', descripcion: 'Otra maquinaria y equipo' },
  { codigo: 'D01', descripcion: 'Honorarios médicos, dentales y gastos hospitalarios' },
  { codigo: 'D02', descripcion: 'Gastos médicos por incapacidad o discapacidad' },
  { codigo: 'D03', descripcion: 'Gastos funerales' },
  { codigo: 'D04', descripcion: 'Donativos' },
  {
    codigo: 'D05',
    descripcion:
      'Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación)',
  },
  { codigo: 'D06', descripcion: 'Aportaciones voluntarias al SAR' },
  { codigo: 'D07', descripcion: 'Primas por seguros de gastos médicos' },
  { codigo: 'D08', descripcion: 'Gastos de transportación escolar obligatoria' },
  {
    codigo: 'D09',
    descripcion: 'Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones',
  },
  { codigo: 'D10', descripcion: 'Pagos por servicios educativos (colegiaturas)' },
  { codigo: 'S01', descripcion: 'Sin efectos fiscales' },
  { codigo: 'CP01', descripcion: 'Pagos' },
  { codigo: 'CN01', descripcion: 'Nómina' },
]

/** Etiqueta legible "601 — General de Ley Personas Morales" a partir de la clave. */
export function etiquetaRegimenFiscal(codigo: string | null | undefined): string {
  const opcion = REGIMENES_FISCALES.find((r) => r.codigo === codigo)
  return opcion ? `${opcion.codigo} — ${opcion.descripcion}` : (codigo ?? '')
}

/** Etiqueta legible "G03 — Gastos en general" a partir de la clave. */
export function etiquetaUsoCfdi(codigo: string | null | undefined): string {
  const opcion = USOS_CFDI.find((u) => u.codigo === codigo)
  return opcion ? `${opcion.codigo} — ${opcion.descripcion}` : (codigo ?? '')
}
