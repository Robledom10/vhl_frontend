import { Component, HostListener, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { Viaje, ContactoEmergencia } from '../../../../models/operaciones.models';

interface Usuario { id: number; firstName: string; lastName: string; }

@Component({
	selector: 'app-emergency-contacts',
	templateUrl: './emergency-contacts.component.html',
	styleUrl: './emergency-contacts.component.css',
})
export class ContactosEmergenciaComponent implements OnInit {
	showForm = false;
	showToast = false;
	toastTitle = '';
	toastMsg = '';
	toastType: 'success' | 'error' = 'success';
	editando: ContactoEmergencia | null = null;

	viajes: Viaje[] = [];
	idViajeSeleccionado: number | null = null;
	viajeDropdownOpen = false;
	contactos: ContactoEmergencia[] = [];
	usuarios: Usuario[] = [];
	usuarioMap: Record<number, string> = {};
	paqueteTituloMap: Record<number, string> = {};

	// Confirmación de eliminar
	showDeleteModal = false;
	contactoAEliminar: ContactoEmergencia | null = null;

	// ─── Paginación contactos ─────────────────────────────
	paginaContactos = 0;
	readonly tamanoContactos = 6;

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

	constructor(private svc: OperacionesService, private authSvc: AuthService) { }

	@HostListener('document:click')
	closeDropdowns(): void {
		this.viajeDropdownOpen = false;
	}

	getNombreViajero(id: number): string {
		return this.usuarioMap[id] || `Viajero #${id}`;
	}

	ngOnInit(): void {
		this.authSvc.getAllUsers().subscribe({
			next: (response: any) => {
				const users: any[] = response?.content ?? (Array.isArray(response) ? response : []);
				this.usuarios = users.map(u => ({ id: u.id, firstName: u.firstName, lastName: u.lastName }));
				this.usuarioMap = Object.fromEntries(this.usuarios.map(u => [u.id, `${u.firstName} ${u.lastName}`]));
			},
			error: () => { }
		});

		this.svc.getViajes().subscribe({
			next: (viajes) => {
				this.viajes = viajes;
				this.svc.getPaqueteTituloMap(viajes).subscribe(m => { this.paqueteTituloMap = m; });
				if (viajes.length > 0) {
					this.idViajeSeleccionado = viajes[0].id;
					this.cargarContactos();
				}
			},
			error: () => {
				this.mostrarToast('Error', 'No se pudieron cargar los viajes.', 'error');
			}
		});
	}

	// ── Custom select de viaje (mismo patrón/lógica que info médica) ──────
	toggleViajeDropdown(event: Event): void {
		event.stopPropagation();
		this.viajeDropdownOpen = !this.viajeDropdownOpen;
	}

	seleccionarViaje(id: number | null): void {
		this.idViajeSeleccionado = id;
		this.viajeDropdownOpen = false;
		this.contactos = [];
		if (this.idViajeSeleccionado) this.cargarContactos();
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

	cargarContactos(): void {
		if (!this.idViajeSeleccionado) return;
		this.paginaContactos = 0;
		const id = this.idViajeSeleccionado;
		forkJoin([
			this.svc.getContactos(id).pipe(catchError(() => of([]))),
			this.svc.getContactosDesdeReservas(id).pipe(catchError(() => of([])))
		]).subscribe(([deOperacion, deReserva]) => {
			const contactosReserva: ContactoEmergencia[] = (deReserva as any[]).map(c => ({
				id: c.id,
				idViaje: id,
				idViajero: 0,
				nombre: c.nombre,
				parentesco: c.parentesco,
				telefono: c.telefono,
				correo: c.correo ?? '',
				fechaRegistro: '',
				nombreViajero: 'Desde reserva',
				fromReserva: true
			}));
			this.contactos = [...(deOperacion as ContactoEmergencia[]), ...contactosReserva];
		});
	}

	abrirNuevo(): void {
		this.editando = null;
		this.showForm = true;
	}

	abrir(contacto: ContactoEmergencia): void {
		this.editando = contacto;
		this.showForm = true;
	}

	cerrarForm(): void { this.showForm = false; this.editando = null; }

	onFormSaved(msg: string): void {
		this.showForm = false;
		this.editando = null;
		this.cargarContactos();
		this.mostrarToast('Listo', msg, 'success');
	}

	onFormFailed(msg: string): void {
		this.mostrarToast('Error', msg, 'error');
	}

	// =========================================
	// ELIMINAR CON CONFIRMACIÓN
	// =========================================

	eliminar(c: ContactoEmergencia): void {
		this.contactoAEliminar = c;
		this.showDeleteModal = true;
	}

	cerrarDeleteModal(): void {
		this.showDeleteModal = false;
		this.contactoAEliminar = null;
	}

	confirmarEliminar(): void {
		if (!this.contactoAEliminar) return;
		const c = this.contactoAEliminar;
		this.showDeleteModal = false;

		this.svc.eliminarContacto(c.idViajero, c.id).subscribe({
			next: () => {
				this.contactos = this.contactos.filter(x => x.id !== c.id);
				this.contactoAEliminar = null;
				this.mostrarToast('Contacto eliminado', `Se eliminó correctamente el contacto ${c.nombre}.`, 'success');
			},
			error: () => {
				this.contactoAEliminar = null;
				this.mostrarToast('Error al eliminar', `No se pudo eliminar el contacto ${c.nombre}.`, 'error');
			}
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