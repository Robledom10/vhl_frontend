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
	formSubmitted = false;
	cargandoEmailsInterno = false;
	paqueteNombre = '';

	// Dropdown viaje
	viajeDropdownOpen = false;

	// Confirmación
	showConfirmModal = false;

	comForm = this.fb.group({
		idViaje: ['', Validators.required],
		asunto: ['', [Validators.required, Validators.minLength(5)]],
		mensaje: ['', [Validators.required, Validators.minLength(20)]],
		canal: ['EMAIL'],
		contactos: ['', Validators.required],
	});

	constructor(private fb: FormBuilder, private svc: OperacionesService) { }

	// ==============================
	// HELPERS
	// ==============================

	get emailCount(): number {
		const val = this.comForm.get('contactos')?.value || '';
		return val.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0).length;
	}

	// Agrega esto junto a tus otros getters (como emailCount)
	get idViajeActual(): string | null {
		return this.comForm.get('idViaje')?.value || null;
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

	getViajeLabel(id: number): string {
		const v = this.viajesFiltrados.find(x => x.id === id);
		if (!v) return '';
		const paquete = this.paqueteTituloMap[v.idPaquete] || `Paquete ${v.idPaquete}`;
		const fecha = v.fechaSalida ? new Date(v.fechaSalida).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
		return `${paquete} — Viaje #${v.id} · ${fecha}`;
	}

	// ==============================
	// DROPDOWN VIAJE
	// ==============================

	toggleViajeDropdown(): void {
		this.viajeDropdownOpen = !this.viajeDropdownOpen;
	}

	selectViaje(v: Viaje): void {
		this.comForm.patchValue({ idViaje: String(v.id) });
		this.viajeDropdownOpen = false;
		this.actualizarPaqueteNombre(v.id);
		this.cargarEmailsViaje(v.id);
	}

	// ==============================
	// CLICK FUERA — cierra dropdown
	// ==============================

	onPanelClick(event: Event): void {
		event.stopPropagation();
		const target = event.target as HTMLElement;
		if (!target.closest('.custom-select')) {
			this.viajeDropdownOpen = false;
		}
	}

	// ==============================
	// LIFECYCLE
	// ==============================

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['isOpen']?.currentValue === true) {
			this.formSubmitted = false;
			this.viajeDropdownOpen = false;

			if (this.editando) {
				this.comForm.patchValue({
					idViaje: String(this.editando.idViaje),
					asunto: this.editando.asunto,
					mensaje: this.editando.mensaje,
					canal: this.editando.canal,
					contactos: '',
				});
				this.actualizarPaqueteNombre(this.editando.idViaje);
			} else {
				this.comForm.reset({
					canal: 'EMAIL',
					idViaje: this.idViajeSeleccionado?.toString() || '',
					contactos: '',
				});
				this.actualizarPaqueteNombre(this.idViajeSeleccionado);
				this.aplicarEmails();
			}
		}

		if ((changes['filtroPago'] || changes['reservasViaje']) && this.isOpen && !this.editando) {
			this.aplicarEmails();
		}
	}

	// ==============================
	// EMAILS / PAQUETE
	// ==============================

	/** Carga emails desde el servidor al cambiar de viaje manualmente */
	private cargarEmailsViaje(idViaje: number): void {
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
			error: () => { this.cargandoEmailsInterno = false; },
		});
	}

	/** Mantiene compatibilidad con el método que usaba el select nativo */
	onViajeFormChange(): void {
		const idViaje = Number(this.comForm.get('idViaje')?.value);
		this.actualizarPaqueteNombre(idViaje || null);
		if (!idViaje) {
			this.comForm.patchValue({ contactos: '' });
			return;
		}
		this.cargarEmailsViaje(idViaje);
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

	// ==============================
	// ENVIAR
	// ==============================

	enviar(): void {
		this.formSubmitted = true;
		if (this.comForm.invalid) {
			this.comForm.markAllAsTouched();
			return;
		}
		this.showConfirmModal = true;
	}

	cerrarConfirmModal(): void {
		this.showConfirmModal = false;
	}

	confirmarEnvio(): void {
		this.showConfirmModal = false;
		this.enviarFormulario();
	}

	private enviarFormulario(): void {
		this.enviando = true;

		const v = this.comForm.value;
		const idViaje = Number(v.idViaje);
		const contactosList = (v.contactos || '')
			.split(',')
			.map((s: string) => s.trim())
			.filter((s: string) => s.length > 0);

		const body = {
			asunto: v.asunto || '',
			mensaje: v.mensaje || '',
			canal: v.canal || 'EMAIL',
			destinatarios: [] as string[],
			contactos: contactosList,
		};

		if (this.editando) {
			this.svc.actualizarNotificacion(idViaje, this.editando.id, body).subscribe({
				next: () => { this.enviando = false; this.saved.emit('Comunicación actualizada'); },
				error: (err) => { this.enviando = false; this.saveFailed.emit(err?.error?.mensaje || 'Error al actualizar'); },
			});
		} else {
			this.svc.enviarNotificacion(idViaje, body).subscribe({
				next: () => { this.enviando = false; this.saved.emit('Comunicación enviada exitosamente'); },
				error: (err) => { this.enviando = false; this.saveFailed.emit(err?.error?.mensaje || 'Error al enviar comunicación'); },
			});
		}
	}
}