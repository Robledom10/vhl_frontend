import { Component, OnInit } from '@angular/core';
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
	contactos: ContactoEmergencia[] = [];
	usuarios: Usuario[] = [];
	usuarioMap: Record<number, string> = {};
	paqueteTituloMap: Record<number, string> = {};

	// Confirmación de eliminar
	showDeleteModal = false;
	contactoAEliminar: ContactoEmergencia | null = null;

	constructor(private svc: OperacionesService, private authSvc: AuthService) { }

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

	onViajeChange(event: Event): void {
		const id = Number((event.target as HTMLSelectElement).value);
		this.idViajeSeleccionado = id || null;
		this.contactos = [];
		if (this.idViajeSeleccionado) this.cargarContactos();
	}

	cargarContactos(): void {
		if (!this.idViajeSeleccionado) return;
		this.svc.getContactos(this.idViajeSeleccionado).subscribe({
			next: (items) => { this.contactos = items; },
			error: () => {
				this.mostrarToast('Error', 'No se pudieron cargar los contactos.', 'error');
			}
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