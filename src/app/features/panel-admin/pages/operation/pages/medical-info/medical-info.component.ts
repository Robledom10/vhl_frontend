import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { Viaje, InformacionMedica, ContactoEmergencia } from '../../../../models/operaciones.models';

@Component({
	selector: 'app-medical-info',
	templateUrl: './medical-info.component.html',
	styleUrl: './medical-info.component.css',
})
export class InfoMedicaComponent implements OnInit {

	// ── Estado compartido ────────────────────────────────────────────
	viajes: Viaje[] = [];
	idViajeSeleccionado: number | null = null;
	paqueteTituloMap: Record<number, string> = {};
	showToast = false;
	toastTitle = '';
	toastMsg = '';
	toastType: 'success' | 'error' = 'success';

	// ── Info Médica ──────────────────────────────────────────────────
	showFormMedico = false;
	editandoMedico: InformacionMedica | null = null;
	registros: InformacionMedica[] = [];

	// ── Contactos de Emergencia ───────────────────────────────────────
	contactos: ContactoEmergencia[] = [];

	// ── Confirmación de eliminar ───────────────────────────────────────
	showDeleteModal = false;
	registroAEliminar: InformacionMedica | null = null;

	constructor(private svc: OperacionesService) { }

	ngOnInit(): void {
		this.svc.getViajes().subscribe({
			next: (viajes) => {
				this.viajes = viajes;
				this.svc.getPaqueteTituloMap(viajes).subscribe(m => { this.paqueteTituloMap = m; });
				if (viajes.length > 0) {
					this.idViajeSeleccionado = viajes[0].id;
					this.cargarTodo();
				}
				this.cargarTodosContactos();
			},
			error: () => {
				this.mostrarToast('Error', 'No se pudieron cargar los viajes.', 'error');
			},
		});
	}

	onViajeChange(event: Event): void {
		const id = Number((event.target as HTMLSelectElement).value);
		this.idViajeSeleccionado = id || null;
		this.registros = [];
		if (this.idViajeSeleccionado) this.cargarTodo();
	}

	cargarTodosContactos(): void {
		if (this.viajes.length === 0) return;
		forkJoin(
			this.viajes.map(v => this.svc.getContactos(v.id).pipe(catchError(() => of([]))))
		).pipe(
			map(results => (results as ContactoEmergencia[][]).flat())
		).subscribe(contactos => {
			this.contactos = contactos;
		});
	}

	cargarTodo(): void {
		if (!this.idViajeSeleccionado) return;
		this.svc.getInformacionMedica(this.idViajeSeleccionado).pipe(
			catchError(() => {
				this.mostrarToast('Error', 'No se pudieron cargar los registros médicos.', 'error');
				return of([]);
			})
		).subscribe(medicos => {
			this.registros = medicos as InformacionMedica[];
		});
	}

	// ── Médico ────────────────────────────────────────────────────────
	abrirNuevoMedico(): void {
		this.editandoMedico = null;
		this.showFormMedico = true;
	}

	abrirMedico(r: InformacionMedica): void {
		this.editandoMedico = r;
		this.showFormMedico = true;
	}

	cerrarFormMedico(): void { this.showFormMedico = false; this.editandoMedico = null; }

	onFormMedicoSaved(msg: string): void {
		this.showFormMedico = false;
		this.editandoMedico = null;
		this.cargarTodo();
		this.mostrarToast('Listo', msg, 'success');
	}

	onFormMedicoFailed(msg: string): void {
		this.mostrarToast('Error', msg, 'error');
	}

	// ── Eliminar con confirmación ───────────────────────────────────────
	eliminarMedico(r: InformacionMedica): void {
		this.registroAEliminar = r;
		this.showDeleteModal = true;
	}

	cerrarDeleteModal(): void {
		this.showDeleteModal = false;
		this.registroAEliminar = null;
	}

	confirmarEliminarMedico(): void {
		if (!this.registroAEliminar) return;
		const r = this.registroAEliminar;
		this.showDeleteModal = false;
		const nombre = r.nombreViajero || 'Viajero #' + r.idViajero;

		this.svc.eliminarInformacionMedica(r.idViajero, r.id).subscribe({
			next: () => {
				this.registroAEliminar = null;
				this.mostrarToast('Registro eliminado', `Se eliminó el registro médico de ${nombre}.`, 'success');
				this.cargarTodo();
			},
			error: () => {
				this.registroAEliminar = null;
				this.mostrarToast('Error al eliminar', `No se pudo eliminar el registro médico de ${nombre}.`, 'error');
			},
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