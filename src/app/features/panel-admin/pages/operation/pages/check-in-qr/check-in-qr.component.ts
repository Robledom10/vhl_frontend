import { Component, HostListener, OnInit } from '@angular/core';
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
	viajeDropdownOpen = false;
	paqueteTituloMap: Record<number, string> = {};

	reservas: ReservaApi[] = [];
	checkinsRealizados: CheckIn[] = [];

	procesando: Record<number, boolean> = {};

	// Confirmación de check-in
	showConfirmModal = false;
	reservaSeleccionada: ReservaApi | null = null;

	showToast = false;
	toastTitle = '';
	toastMsg = '';
	toastType: 'success' | 'error' = 'success';

	// ─── Paginación reservas ──────────────────────────────
	paginaReservas = 0;
	readonly tamanoReservas = 5;

	constructor(private svc: OperacionesService) { }

	@HostListener('document:click')
	closeDropdowns(): void {
		this.viajeDropdownOpen = false;
	}

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
			error: () => {
				this.mostrarToast('Error', 'No se pudieron cargar los viajes.', 'error');
			}
		});
	}

	// ── Custom select de viaje ─────────────────────────────
	toggleViajeDropdown(event: Event): void {
		event.stopPropagation();
		this.viajeDropdownOpen = !this.viajeDropdownOpen;
	}

	seleccionarViaje(id: number | null): void {
		this.viajeDropdownOpen = false;
		this.idViajeSeleccionado = id;
		this.viajeActual = this.viajes.find(v => v.id === id) || null;
		this.reservas = [];
		this.checkinsRealizados = [];
		if (this.idViajeSeleccionado) this.cargarDatos();
	}

	get viajeSeleccionadoLabel(): string {
		if (!this.idViajeSeleccionado) return 'Seleccionar viaje...';
		const v = this.viajes.find(x => x.id === this.idViajeSeleccionado);
		return v ? this.getViajeLabel(v) : 'Seleccionar viaje...';
	}

	getViajeLabel(v: Viaje): string {
		const paquete = this.paqueteTituloMap[v.idPaquete] || `Paquete ${v.idPaquete}`;
		const fecha = v.fechaSalida ? new Date(v.fechaSalida).toLocaleDateString('es-CO') : 'Sin fecha';
		return `${paquete} — Viaje #${v.id} · ${fecha}`;
	}

	cargarDatos(): void {
		if (!this.idViajeSeleccionado || !this.viajeActual) return;
		this.paginaReservas = 0;
		const idPaquete = this.viajeActual.idPaquete;
		forkJoin({
			reservas: this.svc.getReservasPorPaquete(idPaquete).pipe(catchError(() => {
				this.mostrarToast('Error', 'No se pudieron cargar las reservas.', 'error');
				return of([]);
			})),
			checkins: this.svc.getCheckIns(this.idViajeSeleccionado).pipe(catchError(() => {
				this.mostrarToast('Error', 'No se pudieron cargar los check-ins.', 'error');
				return of([]);
			})),
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

	// =========================================
	// CONFIRMACIÓN DE CHECK-IN
	// =========================================

	abrirConfirmacionCheckIn(reserva: ReservaApi): void {
		if (this.yaHizoCheckIn(reserva)) return;
		this.reservaSeleccionada = reserva;
		this.showConfirmModal = true;
	}

	cerrarConfirmacionCheckIn(): void {
		this.showConfirmModal = false;
		this.reservaSeleccionada = null;
	}

	confirmarCheckIn(): void {
		if (!this.reservaSeleccionada) return;
		const reserva = this.reservaSeleccionada;
		this.showConfirmModal = false;
		this.reservaSeleccionada = null;
		this.registrarCheckIn(reserva);
	}

	private registrarCheckIn(reserva: ReservaApi): void {
		if (!this.idViajeSeleccionado || this.yaHizoCheckIn(reserva)) return;
		this.procesando[reserva.id] = true;

		const body = {
			idViajero: reserva.idUsuario,
			codigoQr: reserva.numeroReserva,
			idReserva: reserva.id,
		};

		this.svc.registrarCheckIn(this.idViajeSeleccionado, body).subscribe({
			next: (checkIn) => {
				this.checkinsRealizados.unshift(checkIn);
				this.procesando[reserva.id] = false;
				this.mostrarToast('Check-in registrado', `Se registró correctamente el check-in de ${reserva.numeroReserva}.`, 'success');
			},
			error: (err) => {
				this.procesando[reserva.id] = false;
				this.mostrarToast('Error al registrar', err?.error?.mensaje || 'No se pudo registrar el check-in.', 'error');
			},
		});
	}

	get totalCheckIn(): number { return this.checkinsRealizados.length; }
	get totalPendientes(): number { return this.reservas.filter(r => !this.yaHizoCheckIn(r)).length; }

	mostrarToast(title: string, msg: string, type: 'success' | 'error' = 'success'): void {
		this.toastTitle = title;
		this.toastMsg = msg;
		this.toastType = type;
		this.showToast = true;
		setTimeout(() => { this.showToast = false; }, 3500);
	}

	get reservasPaginadas(): ReservaApi[] {
		const start = this.paginaReservas * this.tamanoReservas;
		return this.reservas.slice(start, start + this.tamanoReservas);
	}

	get totalPaginasReservas(): number {
		return Math.ceil(this.reservas.length / this.tamanoReservas);
	}

	get paginasReservas(): number[] {
		const delta = 2;
		const start = Math.max(0, this.paginaReservas - delta);
		const end = Math.min(this.totalPaginasReservas - 1, this.paginaReservas + delta);
		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	}

	cambiarPaginaReservas(n: number): void {
		if (n < 0 || n >= this.totalPaginasReservas) return;
		this.paginaReservas = n;
	}
}