import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { OperacionesService } from '../../../../../../../../core/services/operaciones.service';
import { Viaje, Notificacion, ReservaApi } from '../../../../../../models/operaciones.models';

@Component({
	selector: 'app-form-communication',
	templateUrl: './form-communication.component.html',
	styleUrl: './form-communication.component.css',
})
export class FormCommunicationComponent implements OnChanges {
	@Input() isOpen = false;
	@Input() editando: Notificacion | null = null;
	@Input() idViajeSeleccionado: number | null = null;
	@Input() viajesFiltrados: Viaje[] = [];
	@Input() paqueteTituloMap: Record<number, string> = {};
	@Input() reservasViaje: ReservaApi[] = [];
	@Input() cargandoEmails = false;
	@Input() filtroPago: 'todos' | 'pagados' | 'no_pagados' = 'todos';

	@Output() closed = new EventEmitter<void>();
	@Output() saved = new EventEmitter<string>();
	@Output() saveFailed = new EventEmitter<string>();
	@Output() filtroPagoChange = new EventEmitter<'todos' | 'pagados' | 'no_pagados'>();

	enviando = false;
	cargandoEmailsInterno = false;
	paqueteNombre = '';

	comForm = this.fb.group({
		idViaje:   ['', Validators.required],
		asunto:    ['', [Validators.required, Validators.minLength(5)]],
		mensaje:   ['', [Validators.required, Validators.minLength(20)]],
		canal:     ['EMAIL'],
		contactos: ['', Validators.required],
	});

	get emailCount(): number {
		const val = this.comForm.get('contactos')?.value || '';
		return val.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0).length;
	}

	get viajerosSummary(): { nombre: string; reserva: string; pagado: boolean }[] {
		let filtradas = this.reservasViaje;
		if (this.filtroPago === 'pagados') filtradas = filtradas.filter(r => r.pagoVerificado);
		else if (this.filtroPago === 'no_pagados') filtradas = filtradas.filter(r => !r.pagoVerificado);

		const lista: { nombre: string; reserva: string; pagado: boolean }[] = [];
		filtradas.forEach(r => {
			const pagado = !!r.pagoVerificado;
			const num = r.numeroReserva || `#${r.id}`;
			if (r.datosUsuario?.nombre) {
				lista.push({ nombre: `${r.datosUsuario.nombre} ${r.datosUsuario.apellido || ''}`.trim(), reserva: num, pagado });
			}
			r.viajeros?.forEach(v => {
				if (v.nombre) lista.push({ nombre: `${v.nombre} ${v.apellido || ''}`.trim(), reserva: num, pagado });
			});
		});
		return lista;
	}

	constructor(private fb: FormBuilder, private svc: OperacionesService) { }

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['isOpen']?.currentValue === true) {
			if (this.editando) {
				this.comForm.patchValue({
					idViaje:   String(this.editando.idViaje),
					asunto:    this.editando.asunto,
					mensaje:   this.editando.mensaje,
					canal:     this.editando.canal,
					contactos: '',
				});
				this.actualizarPaqueteNombre(this.editando.idViaje);
			} else {
				this.comForm.reset({
					canal: 'EMAIL',
					idViaje: this.idViajeSeleccionado?.toString() || '',
					contactos: ''
				});
				this.actualizarPaqueteNombre(this.idViajeSeleccionado);
				this.aplicarEmails();
			}
		}
		if ((changes['filtroPago'] || changes['reservasViaje']) && this.isOpen && !this.editando) {
			this.aplicarEmails();
		}
	}

	onViajeFormChange(): void {
		const idViaje = Number(this.comForm.get('idViaje')?.value);
		this.actualizarPaqueteNombre(idViaje || null);
		if (!idViaje) {
			this.comForm.patchValue({ contactos: '' });
			return;
		}
		this.cargandoEmailsInterno = true;
		this.comForm.patchValue({ contactos: '' });
		this.svc.getReservasPorViaje(idViaje).subscribe({
			next: (reservas) => {
				this.cargandoEmailsInterno = false;
				const emails = new Set<string>();
				reservas.forEach((r: any) => {
					if (r.datosUsuario?.email) emails.add(r.datosUsuario.email);
					(r.viajeros || []).forEach((v: any) => { if (v.email) emails.add(v.email); });
				});
				this.comForm.patchValue({ contactos: Array.from(emails).join(', ') });
			},
			error: () => { this.cargandoEmailsInterno = false; }
		});
	}

	private actualizarPaqueteNombre(idViaje: number | null): void {
		if (!idViaje) { this.paqueteNombre = ''; return; }
		const viaje = this.viajesFiltrados.find(v => v.id === idViaje);
		this.paqueteNombre = viaje ? (this.paqueteTituloMap[viaje.idPaquete] || '') : '';
	}

	onFiltroPagoChange(tipo: 'todos' | 'pagados' | 'no_pagados'): void {
		this.filtroPagoChange.emit(tipo);
	}

	private aplicarEmails(): void {
		let filtradas = this.reservasViaje;
		if (this.filtroPago === 'pagados') filtradas = filtradas.filter(r => r.pagoVerificado);
		else if (this.filtroPago === 'no_pagados') filtradas = filtradas.filter(r => !r.pagoVerificado);
		const emails = new Set<string>();
		filtradas.forEach(r => {
			if (r.datosUsuario?.email) emails.add(r.datosUsuario.email);
			r.viajeros?.forEach(v => { if (v.email) emails.add(v.email); });
		});
		this.comForm.patchValue({ contactos: Array.from(emails).join(', ') });
	}

	cerrar(): void { this.closed.emit(); }

	enviar(): void {
		if (this.comForm.invalid) { this.comForm.markAllAsTouched(); return; }
		this.enviando = true;

		const v = this.comForm.value;
		const idViaje = Number(v.idViaje);
		const contactosList = (v.contactos || '').split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
		const body = {
			asunto:        v.asunto || '',
			mensaje:       v.mensaje || '',
			canal:         v.canal || 'EMAIL',
			destinatarios: [] as string[],
			contactos:     contactosList,
		};

		if (this.editando) {
			this.svc.actualizarNotificacion(idViaje, this.editando.id, body).subscribe({
				next: () => {
					this.enviando = false;
					this.saved.emit('Comunicación actualizada');
				},
				error: (err) => {
					this.enviando = false;
					this.saveFailed.emit(err?.error?.mensaje || 'Error al actualizar');
				}
			});
		} else {
			this.svc.enviarNotificacion(idViaje, body).subscribe({
				next: () => {
					this.enviando = false;
					this.saved.emit('Comunicación enviada exitosamente');
				},
				error: (err) => {
					this.enviando = false;
					this.saveFailed.emit(err?.error?.mensaje || 'Error al enviar comunicación');
				}
			});
		}
	}
}
