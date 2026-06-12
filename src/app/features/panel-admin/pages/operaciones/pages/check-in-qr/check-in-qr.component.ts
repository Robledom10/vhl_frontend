import { Component, OnInit } from '@angular/core';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { Viaje, CheckIn } from '../../../../models/operaciones.models';

@Component({
	selector: 'app-check-in-qr',
	templateUrl: './check-in-qr.component.html',
	styleUrl: './check-in-qr.component.css',
})
export class CheckInQrComponent implements OnInit {
	codigoManual = '';
	idViajeroManual = '';
	idReservaManual = '';
	escaneando = false;
	resultado: { valido: boolean; mensaje: string; checkIn?: CheckIn } | null = null;

	viajes: Viaje[] = [];
	idViajeSeleccionado: number | null = null;
	checkinsRealizados: CheckIn[] = [];
	paqueteTituloMap: Record<number, string> = {};

	constructor(private svc: OperacionesService) { }

	ngOnInit(): void {
		this.svc.getViajes().subscribe({
			next: (viajes) => {
				this.viajes = viajes;
				this.svc.getPaqueteTituloMap(viajes).subscribe(m => { this.paqueteTituloMap = m; });
				if (viajes.length > 0) {
					this.idViajeSeleccionado = viajes[0].id;
					this.cargarHistorial();
				}
			},
			error: () => { }
		});
	}

	onViajeChange(event: Event): void {
		const id = Number((event.target as HTMLSelectElement).value);
		this.idViajeSeleccionado = id || null;
		this.checkinsRealizados = [];
		this.resultado = null;
		if (this.idViajeSeleccionado) this.cargarHistorial();
	}

	cargarHistorial(): void {
		if (!this.idViajeSeleccionado) return;
		this.svc.getCheckIns(this.idViajeSeleccionado).subscribe({
			next: (items) => { this.checkinsRealizados = items; },
			error: () => { }
		});
	}

	validar(): void {
		if (!this.codigoManual.trim() || !this.idViajeSeleccionado) return;
		this.escaneando = true;
		this.resultado = null;

		const body = {
			idViajero: Number(this.idViajeroManual) || 1,
			codigoQr: this.codigoManual.trim(),
			idReserva: this.idReservaManual ? Number(this.idReservaManual) : undefined,
		};

		this.svc.registrarCheckIn(this.idViajeSeleccionado, body).subscribe({
			next: (checkIn) => {
				this.resultado = { valido: true, mensaje: 'Check-in registrado exitosamente.', checkIn };
				this.checkinsRealizados.unshift(checkIn);
				this.escaneando = false;
			},
			error: (err) => {
				this.resultado = { valido: false, mensaje: err?.error?.mensaje || 'Error al registrar check-in.' };
				this.escaneando = false;
			}
		});
	}

	limpiar(): void {
		this.codigoManual = '';
		this.idViajeroManual = '';
		this.idReservaManual = '';
		this.resultado = null;
	}
}