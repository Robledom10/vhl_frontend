import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { Viaje, CheckIn, ReservaApi } from '../../../../models/operaciones.models';

@Component({
	selector: 'app-check-in-qr',
	templateUrl: './check-in-qr.component.html',
	styleUrl: './check-in-qr.component.css',
})
export class CheckInQrComponent implements OnInit {

	viajes: Viaje[] = [];
	idViajeSeleccionado: number | null = null;
	viajeActual: Viaje | null = null;
	paqueteTituloMap: Record<number, string> = {};

	reservas: ReservaApi[] = [];
	checkinsRealizados: CheckIn[] = [];

	procesando: Record<number, boolean> = {};

	showToast = false;
	toastMsg = '';
	toastType: 'success' | 'error' = 'success';

	constructor(private svc: OperacionesService) { }

	ngOnInit(): void {
		this.svc.getViajes().subscribe({
			next: (viajes) => {
				this.viajes = viajes;
				this.svc.getPaqueteTituloMap(viajes).subscribe(m => { this.paqueteTituloMap = m; });
				if (viajes.length > 0) {
					this.idViajeSeleccionado = viajes[0].id;
					this.viajeActual = viajes[0];
					this.cargarDatos();
				}
			},
			error: () => { }
		});
	}

	onViajeChange(event: Event): void {
		const id = Number((event.target as HTMLSelectElement).value);
		this.idViajeSeleccionado = id || null;
		this.viajeActual = this.viajes.find(v => v.id === id) || null;
		this.reservas = [];
		this.checkinsRealizados = [];
		if (this.idViajeSeleccionado) this.cargarDatos();
	}

	cargarDatos(): void {
		if (!this.idViajeSeleccionado || !this.viajeActual) return;
		const idPaquete = this.viajeActual.idPaquete;
		forkJoin({
			reservas: this.svc.getReservasPorPaquete(idPaquete).pipe(catchError(() => of([]))),
			checkins: this.svc.getCheckIns(this.idViajeSeleccionado).pipe(catchError(() => of([]))),
		}).subscribe(({ reservas, checkins }) => {
			this.reservas = reservas as ReservaApi[];
			this.checkinsRealizados = checkins as CheckIn[];
		});
	}

	yaHizoCheckIn(reserva: ReservaApi): boolean {
		return this.checkinsRealizados.some(
			c => c.idViajero === reserva.idUsuario || c.codigoQr === reserva.numeroReserva
		);
	}

	registrarCheckIn(reserva: ReservaApi): void {
		if (!this.idViajeSeleccionado || this.yaHizoCheckIn(reserva)) return;
		this.procesando[reserva.id] = true;

		const body = {
			idViajero: reserva.idUsuario,
			codigoQr:  reserva.numeroReserva,
			idReserva: reserva.id,
		};

		this.svc.registrarCheckIn(this.idViajeSeleccionado, body).subscribe({
			next: (checkIn) => {
				this.checkinsRealizados.unshift(checkIn);
				this.procesando[reserva.id] = false;
				this.mostrarToast(`Check-in registrado: ${reserva.numeroReserva}`);
			},
			error: (err) => {
				this.procesando[reserva.id] = false;
				this.mostrarToast(err?.error?.mensaje || 'Error al registrar check-in', 'error');
			},
		});
	}

	get totalCheckIn(): number { return this.checkinsRealizados.length; }
	get totalPendientes(): number { return this.reservas.filter(r => !this.yaHizoCheckIn(r)).length; }

	mostrarToast(msg: string, type: 'success' | 'error' = 'success'): void {
		this.toastMsg = msg; this.toastType = type; this.showToast = true;
		setTimeout(() => { this.showToast = false; }, 3500);
	}
}