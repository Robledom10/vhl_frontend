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
	toastMsg = '';
	toastType: 'success' | 'error' = 'success';

	// ── Info Médica ──────────────────────────────────────────────────
	showFormMedico = false;
	editandoMedico: InformacionMedica | null = null;
	registros: InformacionMedica[] = [];

	// ── Contactos de Emergencia ───────────────────────────────────────
	contactos: ContactoEmergencia[] = [];

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
			error: () => { },
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
			catchError(() => of([]))
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
		this.mostrarToast(msg);
	}

	onFormMedicoFailed(msg: string): void {
		this.mostrarToast(msg, 'error');
	}

	eliminarMedico(r: InformacionMedica): void {
		if (!confirm(`¿Eliminar el registro médico de ${r.nombreViajero || 'Viajero #' + r.idViajero}?`)) return;
		this.svc.eliminarInformacionMedica(r.idViajero, r.id).subscribe({
			next: () => { this.mostrarToast('Registro médico eliminado'); this.cargarTodo(); },
			error: () => { this.mostrarToast('Error al eliminar', 'error'); },
		});
	}

	mostrarToast(msg: string, type: 'success' | 'error' = 'success'): void {
		this.toastMsg = msg; this.toastType = type; this.showToast = true;
		setTimeout(() => { this.showToast = false; }, 3500);
	}
}
