import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { Viaje, Notificacion, ReservaApi, RespuestaEmail } from '../../../../models/operaciones.models';

@Component({
	selector: 'app-communications',
	templateUrl: './communications.component.html',
	styleUrl: './communications.component.css',
})
export class ComunicacionesComponent implements OnInit {
	showForm = false;
	editando: Notificacion | null = null;
	showToast = false;
	toastTitle = '';
	toastMsg = '';
	toastType: 'success' | 'error' = 'success';

	viajes: Viaje[] = [];
	viajesFiltrados: Viaje[] = [];
	paquetes: { id: number; titulo: string }[] = [];
	idPaqueteSeleccionado: number | null = null;
	idViajeSeleccionado: number | null = null;
	comunicaciones: Notificacion[] = [];
	paqueteTituloMap: Record<number, string> = {};

	reservasViaje: ReservaApi[] = [];
	filtroPago: 'todos' | 'pagados' | 'no_pagados' = 'todos';
	cargandoEmails = false;

	respuestasMap: Record<number, RespuestaEmail[]> = {};
	expandidas: Set<number> = new Set();
	cargandoRespuestas: Set<number> = new Set();

	// Confirmación de eliminar
	showDeleteModal = false;
	comunicacionAEliminar: Notificacion | null = null;

	get emailCount(): number {
		let filtradas = this.reservasViaje;
		if (this.filtroPago === 'pagados') filtradas = filtradas.filter(r => r.pagoVerificado);
		else if (this.filtroPago === 'no_pagados') filtradas = filtradas.filter(r => !r.pagoVerificado);
		const emails = new Set<string>();
		filtradas.forEach(r => {
			if (r.datosUsuario?.email) emails.add(r.datosUsuario.email);
			r.viajeros?.forEach(v => { if (v.email) emails.add(v.email); });
		});
		return emails.size;
	}

	constructor(private svc: OperacionesService) { }

	ngOnInit(): void {
		forkJoin({
			viajes: this.svc.getViajes(),
			paquetes: this.svc.getAllPaquetes()
		}).subscribe({
			next: ({ viajes, paquetes }) => {
				this.viajes = viajes;
				this.paquetes = paquetes;
				this.svc.getPaqueteTituloMap(viajes).subscribe(m => { this.paqueteTituloMap = m; });
			},
			error: () => {
				this.mostrarToast('Error', 'No se pudieron cargar los viajes y paquetes.', 'error');
			}
		});
	}

	onPaqueteChange(event: Event): void {
		const id = Number((event.target as HTMLSelectElement).value);
		this.idPaqueteSeleccionado = id || null;
		this.idViajeSeleccionado = null;
		this.comunicaciones = [];
		this.reservasViaje = [];

		if (this.idPaqueteSeleccionado) {
			this.viajesFiltrados = this.viajes.filter(v => v.idPaquete === this.idPaqueteSeleccionado);
		} else {
			this.viajesFiltrados = [];
		}
	}

	onViajeChange(event: Event): void {
		const id = Number((event.target as HTMLSelectElement).value);
		this.idViajeSeleccionado = id || null;
		this.comunicaciones = [];
		this.reservasViaje = [];
		if (this.idViajeSeleccionado) {
			this.cargarNotificaciones();
			this.cargarEmailsViaje();
		}
	}

	onFiltroPagoChange(filtro: 'todos' | 'pagados' | 'no_pagados'): void {
		this.filtroPago = filtro;
	}

	cargarNotificaciones(): void {
		if (!this.idViajeSeleccionado) return;
		this.svc.getNotificaciones(this.idViajeSeleccionado).subscribe({
			next: (items) => { this.comunicaciones = items; },
			error: () => {
				this.mostrarToast('Error', 'No se pudieron cargar las comunicaciones.', 'error');
			}
		});
	}

	cargarEmailsViaje(): void {
		if (!this.idViajeSeleccionado) return;
		this.cargandoEmails = true;
		this.svc.getReservasPorViaje(this.idViajeSeleccionado).subscribe({
			next: (reservas) => { this.reservasViaje = reservas; this.cargandoEmails = false; },
			error: () => {
				this.cargandoEmails = false;
				this.mostrarToast('Error', 'No se pudieron cargar los correos del viaje.', 'error');
			}
		});
	}

	abrir(): void {
		this.editando = null;
		this.filtroPago = 'todos';
		this.showForm = true;
	}

	editar(c: Notificacion): void {
		this.editando = c;
		this.showForm = true;
	}

	cerrarForm(): void { this.showForm = false; this.editando = null; }

	onFormSaved(msg: string): void {
		this.showForm = false;
		this.editando = null;
		this.cargarNotificaciones();
		this.mostrarToast('Listo', msg, 'success');
	}

	onFormFailed(msg: string): void {
		this.mostrarToast('Error', msg, 'error');
	}

	// ── Eliminar con confirmación ───────────────────────────────────────
	eliminar(c: Notificacion): void {
		this.comunicacionAEliminar = c;
		this.showDeleteModal = true;
	}

	cerrarDeleteModal(): void {
		this.showDeleteModal = false;
		this.comunicacionAEliminar = null;
	}

	confirmarEliminar(): void {
		if (!this.comunicacionAEliminar) return;
		const c = this.comunicacionAEliminar;
		this.showDeleteModal = false;

		this.svc.eliminarNotificacion(c.idViaje, c.id).subscribe({
			next: () => {
				this.comunicaciones = this.comunicaciones.filter(x => x.id !== c.id);
				this.comunicacionAEliminar = null;
				this.mostrarToast('Comunicación eliminada', `Se eliminó correctamente "${c.asunto}".`, 'success');
			},
			error: () => {
				this.comunicacionAEliminar = null;
				this.mostrarToast('Error al eliminar', `No se pudo eliminar "${c.asunto}".`, 'error');
			}
		});
	}

	toggleRespuestas(c: Notificacion): void {
		if (this.expandidas.has(c.id)) {
			this.expandidas.delete(c.id);
			return;
		}
		this.expandidas.add(c.id);
		if (this.respuestasMap[c.id] !== undefined) return;
		this.cargandoRespuestas.add(c.id);
		this.svc.getRespuestasNotificacion(c.idViaje, c.id)
			.pipe(catchError(() => of([] as RespuestaEmail[])))
			.subscribe(r => {
				this.respuestasMap[c.id] = r;
				this.cargandoRespuestas.delete(c.id);
			});
	}

	mostrarToast(title: string, msg: string, type: 'success' | 'error' = 'success'): void {
		this.toastTitle = title;
		this.toastMsg = msg;
		this.toastType = type;
		this.showToast = true;
		setTimeout(() => { this.showToast = false; }, 3500);
	}
}