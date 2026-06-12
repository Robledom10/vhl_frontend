import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { Viaje, Notificacion } from '../../../../models/operaciones.models';

@Component({
	selector: 'app-communications',
	templateUrl: './communications.component.html',
	styleUrl: './communications.component.css',
})
export class ComunicacionesComponent implements OnInit {
	showForm = false;
	editandoId: number | null = null;
	enviando = false;
	showToast = false;
	toastMsg = '';
	toastType: 'success' | 'error' = 'success';

	viajes: Viaje[] = [];
	idViajeSeleccionado: number | null = null;
	comunicaciones: Notificacion[] = [];
	paqueteTituloMap: Record<number, string> = {};

	comForm = this.fb.group({
		idViaje:   ['', Validators.required],
		asunto:    ['', [Validators.required, Validators.minLength(5)]],
		mensaje:   ['', [Validators.required, Validators.minLength(20)]],
		canal:     ['EMAIL', Validators.required],
		contactos: ['', Validators.required],
	});

	get canalActual(): string {
		return this.comForm.get('canal')?.value || 'EMAIL';
	}

	constructor(private fb: FormBuilder, private svc: OperacionesService) { }

	ngOnInit(): void {
		this.svc.getViajes().subscribe({
			next: (viajes) => {
				this.viajes = viajes;
				this.svc.getPaqueteTituloMap(viajes).subscribe(m => { this.paqueteTituloMap = m; });
				if (viajes.length > 0) {
					this.idViajeSeleccionado = viajes[0].id;
					this.cargarNotificaciones();
				}
			},
			error: () => { }
		});
	}

	setCanal(canal: string): void {
		this.comForm.patchValue({ canal });
	}

	onViajeChange(event: Event): void {
		const id = Number((event.target as HTMLSelectElement).value);
		this.idViajeSeleccionado = id || null;
		this.comunicaciones = [];
		if (this.idViajeSeleccionado) this.cargarNotificaciones();
	}

	cargarNotificaciones(): void {
		if (!this.idViajeSeleccionado) return;
		this.svc.getNotificaciones(this.idViajeSeleccionado).subscribe({
			next: (items) => { this.comunicaciones = items; },
			error: () => { }
		});
	}

	abrir(): void {
		this.editandoId = null;
		this.comForm.reset({ canal: 'EMAIL', idViaje: this.idViajeSeleccionado?.toString() || '' });
		this.showForm = true;
	}

	editar(c: Notificacion): void {
		this.editandoId = c.id;
		this.comForm.patchValue({
			idViaje:   String(c.idViaje),
			asunto:    c.asunto,
			mensaje:   c.mensaje,
			canal:     c.canal,
			contactos: '',
		});
		this.showForm = true;
	}

	eliminar(c: Notificacion): void {
		if (!confirm(`¿Eliminar la comunicación "${c.asunto}"?`)) return;
		this.svc.eliminarNotificacion(c.idViaje, c.id).subscribe({
			next: () => {
				this.comunicaciones = this.comunicaciones.filter(x => x.id !== c.id);
				this.mostrarToast('Comunicación eliminada');
			},
			error: () => this.mostrarToast('Error al eliminar', 'error')
		});
	}

	cerrar(): void { this.showForm = false; this.editandoId = null; }

	enviar(): void {
		if (this.comForm.invalid) { this.comForm.markAllAsTouched(); return; }
		this.enviando = true;

		const v = this.comForm.value;
		const idViaje = Number(v.idViaje);
		const contactosList = (v.contactos || '').split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
		const body = {
			asunto:       v.asunto || '',
			mensaje:      v.mensaje || '',
			canal:        v.canal || 'EMAIL',
			destinatarios: [],
			contactos:    contactosList,
		};

		if (this.editandoId) {
			this.svc.actualizarNotificacion(idViaje, this.editandoId, body).subscribe({
				next: (result) => {
					const idx = this.comunicaciones.findIndex(x => x.id === this.editandoId);
					if (idx !== -1) this.comunicaciones[idx] = result;
					this.enviando = false;
					this.showForm = false;
					this.editandoId = null;
					this.mostrarToast('Comunicación actualizada');
				},
				error: (err) => {
					this.enviando = false;
					this.mostrarToast(err?.error?.mensaje || 'Error al actualizar', 'error');
				}
			});
		} else {
			this.svc.enviarNotificacion(idViaje, body).subscribe({
				next: (result) => {
					this.comunicaciones.unshift(result);
					this.enviando = false;
					this.showForm = false;
					this.mostrarToast('Comunicacion enviada exitosamente');
				},
				error: (err) => {
					this.enviando = false;
					this.mostrarToast(err?.error?.mensaje || 'Error al enviar comunicacion', 'error');
				}
			});
		}
	}

	mostrarToast(msg: string, type: 'success' | 'error' = 'success'): void {
		this.toastMsg = msg; this.toastType = type; this.showToast = true;
		setTimeout(() => { this.showToast = false; }, 3500);
	}
}
