import { Component, HostListener, OnInit } from '@angular/core';
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
	viajeDropdownOpen = false;
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

	// ─── Paginación registros médicos ─────────────────────
	paginaRegistros = 0;
	readonly tamanoRegistros = 6;

	get registrosPaginados(): InformacionMedica[] {
		const start = this.paginaRegistros * this.tamanoRegistros;
		return this.registros.slice(start, start + this.tamanoRegistros);
	}

	get totalPaginasRegistros(): number {
		return Math.ceil(this.registros.length / this.tamanoRegistros);
	}

	get paginasRegistros(): number[] {
		const delta = 2;
		const start = Math.max(0, this.paginaRegistros - delta);
		const end = Math.min(this.totalPaginasRegistros - 1, this.paginaRegistros + delta);
		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	}

	cambiarPaginaRegistros(n: number): void {
		if (n < 0 || n >= this.totalPaginasRegistros) return;
		this.paginaRegistros = n;
	}

	// ─── Paginación contactos ─────────────────────────────
	paginaContactos = 0;
	readonly tamanoContactos = 5;

	get contactosPaginados(): ContactoEmergencia[] {
		const start = this.paginaContactos * this.tamanoContactos;
		return this.contactos.slice(start, start + this.tamanoContactos);
	}

	get totalPaginasContactos(): number {
		return Math.ceil(this.contactos.length / this.tamanoContactos);
	}

	get paginasContactos(): number[] {
		const delta = 2;
		const start = Math.max(0, this.paginaContactos - delta);
		const end = Math.min(this.totalPaginasContactos - 1, this.paginaContactos + delta);
		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	}

	cambiarPaginaContactos(n: number): void {
		if (n < 0 || n >= this.totalPaginasContactos) return;
		this.paginaContactos = n;
	}

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
		this.seleccionarViaje(id || null);
	}

	toggleViajeDropdown(event: Event): void {
		event.stopPropagation();
		this.viajeDropdownOpen = !this.viajeDropdownOpen;
	}

	seleccionarViaje(id: number | null): void {
		this.idViajeSeleccionado = id;
		this.viajeDropdownOpen = false;
		this.registros = [];
		if (this.idViajeSeleccionado) this.cargarTodo();
	}

	get viajeSeleccionadoLabel(): string {
		if (!this.idViajeSeleccionado) return 'Seleccionar viaje...';
		const viaje = this.viajes.find(v => v.id === this.idViajeSeleccionado);
		return viaje ? this.getViajeLabel(viaje) : 'Seleccionar viaje...';
	}

	getViajeLabel(viaje: Viaje): string {
		const paquete = this.paqueteTituloMap[viaje.idPaquete] || `Paquete ${viaje.idPaquete}`;
		const fecha = viaje.fechaSalida ? new Date(viaje.fechaSalida).toLocaleDateString('es-CO') : 'Sin fecha';
		return `${paquete} - Viaje #${viaje.id} - ${fecha}`;
	}

	cargarTodosContactos(): void {
		if (this.viajes.length === 0) return;
		this.paginaRegistros = 0;
		forkJoin([
			forkJoin(this.viajes.map(v => this.svc.getContactos(v.id).pipe(catchError(() => of([]))))).pipe(
				map(results => (results as ContactoEmergencia[][]).flat())
			),
			forkJoin(this.viajes.map(v => this.svc.getContactosDesdeReservas(v.id).pipe(catchError(() => of([]))))).pipe(
				map(results => (results as any[][]).flat().map(c => ({
					id: c.id,
					idViaje: 0,
					idViajero: 0,
					nombre: c.nombre,
					parentesco: c.parentesco,
					telefono: c.telefono,
					correo: c.correo ?? '',
					fechaRegistro: '',
					nombreViajero: 'Desde reserva',
					fromReserva: true
				} as ContactoEmergencia)))
			)
		]).subscribe(([deOperacion, deReserva]) => {
			this.contactos = [...deOperacion, ...deReserva];
		});
	}

	cargarTodo(): void {
		if (!this.idViajeSeleccionado) return;
		this.paginaContactos = 0;
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
