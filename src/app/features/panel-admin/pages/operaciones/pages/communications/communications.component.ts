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
	enviando = false;
	showToast = false;
	toastMsg = '';
	toastType: 'success' | 'error' = 'success';

	viajes: Viaje[] = [];
	idViajeSeleccionado: number | null = null;
	comunicaciones: Notificacion[] = [];
	paqueteTituloMap: Record<number, string> = {};

	canales = ['EMAIL', 'SMS', 'PUSH', 'WHATSAPP'];

	comForm = this.fb.group({
		idViaje: ['', Validators.required],
		asunto: ['', [Validators.required, Validators.minLength(5)]],
		mensaje: ['', [Validators.required, Validators.minLength(20)]],
		canal: ['EMAIL', Validators.required],
	});

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
		this.comForm.reset({ canal: 'EMAIL', idViaje: this.idViajeSeleccionado?.toString() || '' });
		this.showForm = true;
	}
	cerrar(): void { this.showForm = false; }

	enviar(): void {
		if (this.comForm.invalid) { this.comForm.markAllAsTouched(); return; }
		this.enviando = true;

		const v = this.comForm.value;
		const idViaje = Number(v.idViaje);
		const body = {
			asunto: v.asunto || '',
			mensaje: v.mensaje || '',
			canal: v.canal || 'EMAIL',
			destinatarios: [],
		};

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

	mostrarToast(msg: string, type: 'success' | 'error' = 'success'): void {
		this.toastMsg = msg; this.toastType = type; this.showToast = true;
		setTimeout(() => { this.showToast = false; }, 3500);
	}
}
