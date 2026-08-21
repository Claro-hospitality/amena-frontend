import QRCode from 'qrcode'

/**
 * QR del boleto como data URL. El contenido es el folio en texto plano: es lo que lee el
 * escáner de boletos (`validarBoleto` busca por folio), no un token firmado.
 */
export function generarQrDataUrl(texto: string): Promise<string> {
  return QRCode.toDataURL(texto, { margin: 1, width: 240 })
}
