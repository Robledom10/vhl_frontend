

import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

const PRIMARY = '#3fa2db';
const DARK    = '#123862';
const GRAY    = '#6b7280';
const BLACK   = '#1e1e1e';

export interface DatosContrato {
  titular: {
    nombre: string;
    tipoDocumento: string;
    numeroDocumento: string;
    telefono: string;
    ciudad: string;
  };
  paquete: {
    nombre: string;
    destino: string;
    duracion: string;
    lugarSalida: string;
  };
  viaje: {
    fechaSalida: string;
    fechaRegreso: string;
  };
  acompanantes: {
    nombre: string;
    tipoDocumento: string;
    documento: string;
    fechaNacimiento: string;
  }[];
  habitacion: string;
  solicitudEspecial: string;
  notas: string;
  contactosEmergencia: {
    nombre: string;
    parentesco: string;
    telefono: string;
    correo?: string;
  }[];
  total: number;
  personas: number;
}

@Injectable({ providedIn: 'root' })
export class PdfService {

  private loadLogo(): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload  = () => resolve(img);
      img.onerror = reject;
      img.src = '/assets/images/logo.png';
    });
  }

  private buildHeader(doc: jsPDF, logo: HTMLImageElement, title: string): void {
    const pageW = doc.internal.pageSize.getWidth();
    const cx    = pageW / 2;

    // Banner único en azul claro
    doc.setFillColor(PRIMARY);
    doc.rect(0, 0, pageW, 62, 'F');

    // Logo a la izquierda, centrado verticalmente
    doc.addImage(logo, 'PNG', 10, 6, 34, 34);

    // "AGENCIA DE VIAJES Y EXCURSIONES" centrado — espaciado con espacios literales
    // para que align:'center' calcule correctamente el ancho
    const agencyLabel = 'A G E N C I A   D E   V I A J E S   Y   E X C U R S I O N E S';
    doc.setTextColor('#ffffff');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(agencyLabel, cx, 18, { align: 'center' });

    // "Hernando Lopera" centrado, grande y negrita
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Hernando Lopera', cx, 35, { align: 'center' });

    // Línea separadora blanca tenue
    doc.setDrawColor('#ffffff');
    doc.setLineWidth(0.4);
    doc.line(14, 46, pageW - 14, 46);

    // Título del documento centrado, mismo fondo azul claro
    doc.setTextColor('#ffffff');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(title, cx, 56, { align: 'center' });
  }

  private buildFooter(doc: jsPDF): void {
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    doc.setDrawColor(PRIMARY);
    doc.setLineWidth(0.4);
    doc.line(12, pageH - 18, pageW - 12, pageH - 18);

    doc.setTextColor(GRAY);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      '© 2026 Hernando Lopera Viajes y Excursiones. Todos los derechos reservados.',
      pageW / 2,
      pageH - 10,
      { align: 'center' }
    );
  }

  private addSection(
    doc: jsPDF,
    title: string,
    bullets: string[],
    y: number
  ): number {
    const margin  = 14;
    const pageW   = doc.internal.pageSize.getWidth();
    const pageH   = doc.internal.pageSize.getHeight();
    const contentW = pageW - margin * 2;
    const footerY  = pageH - 25;

    if (y > footerY - 30) {
      doc.addPage();
      this.buildFooter(doc);
      y = 20;
    }

    doc.setTextColor(PRIMARY);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, y);
    y += 7;

    doc.setDrawColor(PRIMARY);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + contentW, y);
    y += 6;

    doc.setTextColor(BLACK);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    for (const bullet of bullets) {
      const lines = doc.splitTextToSize(`• ${bullet}`, contentW - 6);
      if (y + lines.length * 5.5 > footerY) {
        doc.addPage();
        this.buildFooter(doc);
        y = 20;
      }
      doc.text(lines, margin + 4, y);
      y += lines.length * 5.5 + 2;
    }

    return y + 5;
  }

  private addAcceptanceBox(doc: jsPDF, text: string, y: number): void {
    const margin   = 14;
    const pageW    = doc.internal.pageSize.getWidth();
    const pageH    = doc.internal.pageSize.getHeight();
    const boxW     = pageW - margin * 2;
    const lineH    = 5.5;
    const padTop   = 10;
    const padLabel = 8;
    const padText  = 16;
    const padBot   = 8;

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    const wrapped = doc.splitTextToSize(text, boxW - 10);
    const boxH    = padTop + (padText - padTop) + wrapped.length * lineH + padBot;

    if (y + boxH > pageH - 25) {
      doc.addPage();
      this.buildFooter(doc);
      y = 20;
    }

    y += 4;
    doc.setFillColor('#f0f9ff');
    doc.setDrawColor(PRIMARY);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, boxW, boxH, 3, 3, 'FD');

    doc.setTextColor(DARK);
    doc.setFont('helvetica', 'bold');
    doc.text('Aceptación:', margin + 4, y + padLabel);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(BLACK);
    doc.text(wrapped, margin + 4, y + padText);
  }

  async generateCancelacionPDF(): Promise<void> {
    const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const logo = await this.loadLogo();

    this.buildHeader(doc, logo, 'Política de Cancelación');
    this.buildFooter(doc);

    let y = 74;

    y = this.addSection(doc, '1. Cancelaciones y Reembolsos', [
      'Los pagos realizados a la agencia no son reembolsables bajo ninguna circunstancia.'
    ], y);

    y = this.addSection(doc, '2. Política de No Presentación (No Show)', [
      'Si el viajero no se presenta en la fecha, hora o lugar de salida establecidos, se entenderá como cancelación voluntaria.',
      'No habrá derecho a reembolso, salvo que las políticas del proveedor indiquen lo contrario.'
    ], y);

    y = this.addSection(doc, '3. Cambios de Fecha o Nombre', [
      'Los cambios de fecha o nombre estarán sujetos a disponibilidad y podrán generar costos adicionales.',
      'La agencia no garantiza que los proveedores acepten modificaciones.'
    ], y);

    y = this.addSection(doc, '4. Responsabilidad de la Agencia', [
      'La agencia actúa como intermediaria entre el cliente y los prestadores de servicios turísticos.',
      'No será responsable por retrasos, cancelaciones, cambios climáticos, desastres naturales, cierres de vías, huelgas, problemas de orden público o cualquier evento de fuerza mayor.',
      'Tampoco responderá por pérdidas, robos o daños a equipaje y pertenencias personales durante el viaje.'
    ], y);

    this.addAcceptanceBox(
      doc,
      'Al realizar la reserva y efectuar cualquier pago, el cliente declara haber leído, comprendido y aceptado esta política de cancelación.',
      y
    );

    doc.save('politica-de-cancelacion.pdf');
  }

  async generateTerminosCondicionesPDF(): Promise<void> {
    const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const logo = await this.loadLogo();

    this.buildHeader(doc, logo, 'Términos y Condiciones');
    this.buildFooter(doc);

    let y = 74;

    y = this.addSection(doc, '1. Reservas', [
      'Toda reserva se considera confirmada una vez se haya realizado el abono inicial.',
      'El cliente es responsable de suministrar información personal veraz y completa.'
    ], y);

    y = this.addSection(doc, '2. Pagos', [
      'Los pagos deberán realizarse dentro de las fechas establecidas por la agencia.'
    ], y);

    y = this.addSection(doc, '3. Cancelaciones y Reembolsos', [
      'Los pagos realizados no son reembolsables.'
    ], y);

    y = this.addSection(doc, '4. Cambios', [
      'Los cambios de fecha o nombre estarán sujetos a disponibilidad y podrán generar costos adicionales.',
      'La agencia no garantiza que los proveedores acepten modificaciones.'
    ], y);

    y = this.addSection(doc, '5. Documentación', [
      'Es responsabilidad del viajero contar con documento de identidad, pasaporte, visas, permisos para menores, vacunas y demás requisitos exigidos por las autoridades.',
      'La agencia no será responsable por la negación de ingreso o salida debido a documentación incompleta o vencida.'
    ], y);

    y = this.addSection(doc, '6. Equipaje', [
      'Cada proveedor establece sus propias políticas sobre equipaje permitido, peso y costos adicionales.',
      'La agencia únicamente informa dichas condiciones, pero no define ni modifica estas políticas.'
    ], y);

    y = this.addSection(doc, '7. Responsabilidad', [
      'La agencia actúa como intermediaria entre el cliente y los prestadores de servicios turísticos.',
      'No será responsable por retrasos, cancelaciones, cambios climáticos, desastres naturales, cierres de vías, huelgas, problemas de orden público o cualquier evento de fuerza mayor que afecte el viaje.',
      'Tampoco responderá por pérdidas, robos, daños a equipaje o pertenencias personales durante el viaje.'
    ], y);

    y = this.addSection(doc, '8. Comportamiento del Viajero', [
      'El viajero deberá mantener un comportamiento respetuoso con los demás pasajeros, el personal de la agencia y los proveedores.',
      'La agencia podrá retirar del viaje a cualquier persona cuyo comportamiento represente un riesgo para el grupo, sin derecho a reembolso.'
    ], y);

    y = this.addSection(doc, '9. Horarios', [
      'Es obligación del viajero presentarse puntualmente en los lugares y horarios establecidos.',
      'La agencia no asumirá costos por pérdida de servicios ocasionada por retrasos del cliente.'
    ], y);

    y = this.addSection(doc, '10. Menores de Edad', [
      'Todo menor deberá viajar acompañado por un adulto responsable y con la documentación requerida por la ley.'
    ], y);

    y = this.addSection(doc, '11. Política de No Presentación (No Show)', [
      'Si el viajero no se presenta en la fecha, hora o lugar de salida establecidos, se entenderá como cancelación voluntaria y no habrá derecho a reembolso, salvo que las políticas del proveedor indiquen lo contrario.'
    ], y);

    this.addAcceptanceBox(
      doc,
      'Al realizar la reserva y efectuar cualquier pago, el cliente declara haber leído, comprendido y aceptado estos términos y condiciones en su totalidad.',
      y
    );

    doc.save('terminos-y-condiciones.pdf');
  }

  // ── Helpers exclusivos del contrato ──────────────────────────────────────

  private formatFecha(iso: string): string {
    if (!iso) return '—';
    const d = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  private formatCOP(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(value);
  }

  private addDataTable(
    doc: jsPDF,
    title: string,
    rows: { key: string; value: string }[],
    y: number
  ): number {
    const margin  = 14;
    const pageW   = doc.internal.pageSize.getWidth();
    const pageH   = doc.internal.pageSize.getHeight();
    const contentW = pageW - margin * 2;
    const colW    = 68;
    const footerY = pageH - 25;

    if (y > footerY - 30) {
      doc.addPage();
      this.buildFooter(doc);
      y = 20;
    }

    // Cabecera de sección (fondo azul claro igual al banner)
    doc.setFillColor(PRIMARY);
    doc.roundedRect(margin, y, contentW, 9, 2, 2, 'F');
    doc.setTextColor('#ffffff');
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), margin + 4, y + 6.2);
    y += 12;

    let alternate = false;
    doc.setFontSize(9.5);

    for (const row of rows) {
      const valLines = doc.splitTextToSize(row.value || '—', contentW - colW - 6);
      const rowH = Math.max(valLines.length * 5.5, 6) + 4;

      if (y + rowH > footerY) {
        doc.addPage();
        this.buildFooter(doc);
        y = 20;
      }

      if (alternate) {
        doc.setFillColor('#f0f7fd');
        doc.rect(margin, y - 1, contentW, rowH, 'F');
      }
      alternate = !alternate;

      doc.setTextColor(GRAY);
      doc.setFont('helvetica', 'bold');
      doc.text(row.key, margin + 3, y + 4.5);

      doc.setTextColor(BLACK);
      doc.setFont('helvetica', 'normal');
      doc.text(valLines, margin + colW, y + 4.5);

      // Línea divisoria sutil
      doc.setDrawColor('#e5eaf0');
      doc.setLineWidth(0.2);
      doc.line(margin, y + rowH - 1, margin + contentW, y + rowH - 1);

      y += rowH;
    }

    return y + 6;
  }

  private addAcceptanceBoxReturn(doc: jsPDF, text: string, y: number): number {
    const margin   = 14;
    const pageW    = doc.internal.pageSize.getWidth();
    const pageH    = doc.internal.pageSize.getHeight();
    const boxW     = pageW - margin * 2;
    const lineH    = 5.5;
    const padTop   = 10;
    const padText  = 16;
    const padBot   = 8;

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    const wrapped = doc.splitTextToSize(text, boxW - 10);
    const boxH    = padTop + (padText - padTop) + wrapped.length * lineH + padBot;

    if (y + boxH > pageH - 25) {
      doc.addPage();
      this.buildFooter(doc);
      y = 20;
    }

    y += 4;
    doc.setFillColor('#f0f9ff');
    doc.setDrawColor(PRIMARY);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, boxW, boxH, 3, 3, 'FD');

    doc.setTextColor(DARK);
    doc.setFont('helvetica', 'bold');
    doc.text('Aceptación:', margin + 4, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(BLACK);
    doc.text(wrapped, margin + 4, y + padText);

    return y + boxH + 6;
  }

  private addFirmas(
    doc: jsPDF,
    nombreTitular: string,
    tipoDoc: string,
    numDoc: string,
    y: number
  ): void {
    const margin  = 14;
    const pageW   = doc.internal.pageSize.getWidth();
    const pageH   = doc.internal.pageSize.getHeight();
    const contentW = pageW - margin * 2;
    const colW    = contentW / 2 - 6;
    const lineY   = 22;
    const boxH    = 52;

    if (y + boxH > pageH - 25) {
      doc.addPage();
      this.buildFooter(doc);
      y = 20;
    }

    y += 8;

    // Cabecera de sección firmas
    doc.setFillColor(PRIMARY);
    doc.roundedRect(margin, y, contentW, 9, 2, 2, 'F');
    doc.setTextColor('#ffffff');
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text('8. FIRMAS', margin + 4, y + 6.2);
    y += 14;

    const leftX  = margin;
    const rightX = margin + colW + 12;

    // ── Bloque TITULAR ──────────────────────────────
    doc.setFillColor('#f8fbff');
    doc.setDrawColor('#d1e8f7');
    doc.setLineWidth(0.4);
    doc.roundedRect(leftX, y, colW, boxH, 3, 3, 'FD');

    doc.setTextColor(DARK);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Titular / Excursionista', leftX + colW / 2, y + 8, { align: 'center' });

    // Línea de firma
    doc.setDrawColor(BLACK);
    doc.setLineWidth(0.5);
    doc.line(leftX + 8, y + lineY, leftX + colW - 8, y + lineY);

    doc.setTextColor(GRAY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const nombreWrapped = doc.splitTextToSize(nombreTitular, colW - 16);
    doc.text(nombreWrapped, leftX + colW / 2, y + lineY + 6, { align: 'center' });
    doc.text(`${tipoDoc}: ${numDoc}`, leftX + colW / 2, y + lineY + 12, { align: 'center' });

    doc.setTextColor(GRAY);
    doc.setFontSize(7.5);
    doc.text('Fecha: _____ / _____ / _________', leftX + colW / 2, y + boxH - 6, { align: 'center' });

    // ── Bloque AGENCIA ──────────────────────────────
    doc.setFillColor('#f8fbff');
    doc.setDrawColor('#d1e8f7');
    doc.setLineWidth(0.4);
    doc.roundedRect(rightX, y, colW, boxH, 3, 3, 'FD');

    doc.setTextColor(DARK);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Representante de la Agencia', rightX + colW / 2, y + 8, { align: 'center' });

    doc.setDrawColor(BLACK);
    doc.setLineWidth(0.5);
    doc.line(rightX + 8, y + lineY, rightX + colW - 8, y + lineY);

    doc.setTextColor(GRAY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Hernando Lopera', rightX + colW / 2, y + lineY + 6, { align: 'center' });
    doc.text('Hernando Lopera Viajes y Excursiones', rightX + colW / 2, y + lineY + 12, { align: 'center' });

    doc.setFontSize(7.5);
    doc.text('Fecha: _____ / _____ / _________', rightX + colW / 2, y + boxH - 6, { align: 'center' });
  }

  async generateContratoPDF(datos: DatosContrato, action: 'preview' | 'download' = 'download'): Promise<void> {
    const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const logo = await this.loadLogo();
    const pageW = doc.internal.pageSize.getWidth();

    const hoy      = new Date();
    const fechaHoy = hoy.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const refNum   = `VHL-${hoy.getFullYear()}${String(hoy.getMonth() + 1).padStart(2, '0')}${String(hoy.getDate()).padStart(2, '0')}-${String(hoy.getTime()).slice(-4)}`;

    this.buildHeader(doc, logo, 'Contrato de Prestación de Servicios Turísticos');
    this.buildFooter(doc);

    let y = 70;

    // Referencia y fecha (alineadas a la derecha)
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(GRAY);
    doc.text(`Ref: ${refNum}`, pageW - 14, y, { align: 'right' });
    y += 5;
    doc.text(`Fecha de expedición: ${fechaHoy}`, pageW - 14, y, { align: 'right' });
    y += 10;

    // ── 1. DATOS DEL CLIENTE ─────────────────────────────────────────────
    y = this.addDataTable(doc, '1. Datos del cliente', [
      { key: 'Nombre completo',       value: datos.titular.nombre },
      { key: 'Tipo de documento',     value: datos.titular.tipoDocumento },
      { key: 'Número de documento',   value: datos.titular.numeroDocumento },
      { key: 'Teléfono de contacto',  value: datos.titular.telefono },
      { key: 'Ciudad de residencia',  value: datos.titular.ciudad },
    ], y);

    // ── 2. DETALLE DEL PAQUETE ──────────────────────────────────────────
    y = this.addDataTable(doc, '2. Detalle del paquete', [
      { key: 'Nombre del paquete', value: datos.paquete.nombre },
      { key: 'Destino(s)',         value: datos.paquete.destino },
      { key: 'Fecha de salida',    value: this.formatFecha(datos.viaje.fechaSalida) },
      { key: 'Fecha de regreso',   value: this.formatFecha(datos.viaje.fechaRegreso) },
      { key: 'Duración',           value: datos.paquete.duracion },
      { key: 'Lugar de salida',    value: datos.paquete.lugarSalida || '—' },
      { key: 'Número de viajeros', value: String(datos.personas) },
    ], y);

    // ── 3. VIAJEROS ──────────────────────────────────────────────────────
    const filasViajeros: { key: string; value: string }[] = [
      { key: 'Titular', value: `${datos.titular.nombre} — ${datos.titular.tipoDocumento} ${datos.titular.numeroDocumento}` },
      ...datos.acompanantes.map((a, i) => ({
        key: `Acompañante ${i + 1}`,
        value: `${a.nombre} — ${a.tipoDocumento} ${a.documento}${a.fechaNacimiento ? ` — Nac: ${this.formatFecha(a.fechaNacimiento)}` : ''}`
      }))
    ];
    y = this.addDataTable(doc, '3. Viajeros', filasViajeros, y);

    // ── 4. SERVICIOS SOLICITADOS ─────────────────────────────────────────
    y = this.addDataTable(doc, '4. Servicios solicitados', [
      { key: 'Tipo de habitación',   value: datos.habitacion || '—' },
      { key: 'Solicitud especial',   value: datos.solicitudEspecial || 'Ninguna' },
      { key: 'Notas adicionales',    value: datos.notas || '—' },
    ], y);

    // ── 5. CONTACTOS DE EMERGENCIA ───────────────────────────────────────
    const filasEmergencia = datos.contactosEmergencia.map((c, i) => ({
      key: `Contacto ${i + 1}`,
      value: `${c.nombre} (${c.parentesco}) — Tel: ${c.telefono}${c.correo ? ` — ${c.correo}` : ''}`
    }));
    y = this.addDataTable(doc, '5. Contactos de emergencia', filasEmergencia, y);

    // ── 6. VALOR DEL SERVICIO ────────────────────────────────────────────
    y = this.addDataTable(doc, '6. Valor del servicio', [
      { key: 'Total a pagar',  value: this.formatCOP(datos.total) },
      { key: 'Forma de pago',  value: 'Pasarela de pago Wompi (tarjeta débito / crédito)' },
      { key: 'Nota',           value: 'La reserva quedará confirmada una vez se realice el pago.' },
    ], y);

    // ── 7. DECLARACIÓN Y ACEPTACIÓN ──────────────────────────────────────
    const declaracion =
      'Al descargar y/o firmar este contrato, el cliente declara haber leído, comprendido y aceptado en su ' +
      'totalidad los Términos y Condiciones y la Política de Cancelación de Hernando Lopera Viajes y ' +
      'Excursiones. Acepta que los pagos realizados no son reembolsables conforme a dichas políticas, y que ' +
      'es su responsabilidad contar con la documentación requerida para el viaje.';

    y = this.addAcceptanceBoxReturn(doc, declaracion, y);

    // ── 8. FIRMAS ────────────────────────────────────────────────────────
    this.addFirmas(doc, datos.titular.nombre, datos.titular.tipoDocumento, datos.titular.numeroDocumento, y);

    if (action === 'preview') {
      const blob = doc.output('blob');
      const url  = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } else {
      doc.save(`contrato-vhl-${refNum}.pdf`);
    }
  }
}
