import { Component } from '@angular/core';

interface ResultadoScan {
  valido: boolean;
  viajero?: { nombre: string; documento: string; viaje: string; fecha: string; asiento: string };
  mensaje: string;
}

@Component({
  selector: 'app-check-in-qr',
  templateUrl: './check-in-qr.component.html',
  styleUrl: './check-in-qr.component.css',
})
export class CheckInQrComponent {
  codigoManual = '';
  escaneando = false;
  resultado: ResultadoScan | null = null;
  checkinsRealizados: { nombre: string; documento: string; viaje: string; hora: string }[] = [];

  validar(): void {
    if (!this.codigoManual.trim()) return;
    this.escaneando = true;
    this.resultado = null;

    setTimeout(() => {
      if (this.codigoManual.startsWith('VHL-')) {
        const yaHizoCheckin = this.checkinsRealizados.some(c => c.documento === '123456789');
        if (yaHizoCheckin) {
          this.resultado = { valido: false, mensaje: 'Este viajero ya realizó check-in anteriormente.' };
        } else {
          this.resultado = {
            valido: true,
            mensaje: 'Check-in registrado exitosamente.',
            viajero: { nombre: 'Carlos Martínez', documento: '123456789', viaje: 'Plan excursión 2026', fecha: '2026-06-09', asiento: 'A-12' }
          };
          this.checkinsRealizados.push({ nombre: 'Carlos Martínez', documento: '123456789', viaje: 'Plan excursión 2026', hora: new Date().toLocaleTimeString() });
        }
      } else {
        this.resultado = { valido: false, mensaje: 'Código QR inválido. No corresponde a ninguna reserva.' };
      }
      this.escaneando = false;
    }, 800);
  }

  limpiar(): void {
    this.codigoManual = '';
    this.resultado = null;
  }
}
