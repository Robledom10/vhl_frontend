import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { OperacionesService } from '../../../../../../../../core/services/operaciones.service';
import { RespuestaProveedor } from '../../../../../../models/package.model';
import { ViajeTransporteDisplay } from '../../../../models/operaciones-display.models';

@Component({
	selector: 'app-form-assign-transport',
	templateUrl: './form-assign-transport.component.html',
	styleUrl: './form-assign-transport.component.css',
})
export class FormAssignTransportComponent implements OnChanges {
	@Input() isOpen = false;
	@Input() viajes: ViajeTransporteDisplay[] = [];
	@Input() viajeSeleccionado: ViajeTransporteDisplay | null = null;
	@Input() editandoTransporteId: number | null = null;
	@Input() proveedores: RespuestaProveedor[] = [];
	@Input() preloadData: Partial<{
		empresa: string; tipoVehiculo: string; placa: string;
		conductor: string; telefonoConductor: string; capacidad: string;
	}> | null = null;

	@Output() closed = new EventEmitter<void>();
	@Output() saved = new EventEmitter<string>();
	@Output() saveFailed = new EventEmitter<string>();

	enviando = false;
	formSubmitted = false;

	showConfirmModal = false;

	transporteForm = this.fb.group({
		idViaje: [''],
		empresa: ['', [Validators.required, Validators.minLength(3)]],
		tipoVehiculo: ['', Validators.required],
		capacidad: ['', [Validators.required, Validators.min(1)]],
		cantidadViajeros: ['', [Validators.required, Validators.min(1)]],
		conductor: ['', [Validators.required, Validators.minLength(3)]],
		telefonoConductor: ['', [Validators.required, Validators.pattern(/^[+\d\s\-]{7,20}$/)]],
		horarioSalida: [''],
		placa: ['', [Validators.required, Validators.minLength(5)]],
	});

	// ==============================
	// CUSTOM SELECT
	// ==============================

	openSelect: string | null = null;
	selectedViajeId: number | '' = '';
	selectedProveedorId: number | '' = '';

	toggleSelect(key: string, event?: Event): void {
		event?.stopPropagation();
		this.openSelect = this.openSelect === key ? null : key;
	}

	isSelectOpen(key: string): boolean {
		return this.openSelect === key;
	}

	selectViajeOption(v: ViajeTransporteDisplay): void {
		if (!v.tieneViaje || v.id === null) return;
		this.selectedViajeId = v.id;
		this.transporteForm.patchValue({
			idViaje: String(v.id),
			horarioSalida: v.fecha,
		});
		this.openSelect = null;
	}

	selectProveedorOption(p: RespuestaProveedor): void {
		this.selectedProveedorId = p.id;
		this.transporteForm.patchValue({
			empresa: p.nombre,
			tipoVehiculo: p.tipoVehiculo || '',
			placa: p.placa || '',
			conductor: p.conductor || '',
			telefonoConductor: p.telefonoConductor || p.telefono || '',
			capacidad: p.capacidad ? String(p.capacidad) : '',
		});
		this.openSelect = null;
	}

	clearProveedor(): void {
		this.selectedProveedorId = '';
		this.openSelect = null;
	}

	getViajeLabel(id: number | ''): string {
		const v = this.viajes.find(x => x.id === id);
		return v ? v.nombre : '';
	}

	getProveedorLabel(id: number | ''): string {
		const p = this.proveedores.find(x => x.id === id);
		if (!p) return '';
		return `${p.nombre}${p.tipoVehiculo ? ' · ' + p.tipoVehiculo : ''}${p.placa ? ' · Placa: ' + p.placa : ''}${p.conductor ? ' · ' + p.conductor : ''}`;
	}

	// ==============================
	// CALENDARIO
	// ==============================

	openCalendarSalida = false;
	todayStr = this.formatDate(new Date());

	constructor(private fb: FormBuilder, private svc: OperacionesService) { }

	toggleCalendarSalida(event?: Event): void {
		event?.stopPropagation();
		if (this.viajeSeleccionado || this.transporteForm.get('idViaje')?.value) return;
		this.openCalendarSalida = !this.openCalendarSalida;
	}

	onFechaSalidaSelected(date: string): void {
		this.transporteForm.patchValue({ horarioSalida: date });
		this.transporteForm.get('horarioSalida')?.markAsTouched();
		this.openCalendarSalida = false;
	}

	private formatDate(d: Date): string {
		return [
			d.getFullYear(),
			String(d.getMonth() + 1).padStart(2, '0'),
			String(d.getDate()).padStart(2, '0'),
		].join('-');
	}

	// ==============================
	// LIFECYCLE
	// ==============================

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['isOpen'] && this.isOpen) {
			this.transporteForm.reset();
			this.openSelect = null;
			this.openCalendarSalida = false;
			this.selectedViajeId = '';
			this.selectedProveedorId = '';
			this.formSubmitted = false;

			const idViajeControl = this.transporteForm.get('idViaje');
			if (!this.viajeSeleccionado) {
				idViajeControl?.setValidators([Validators.required]);
			} else {
				idViajeControl?.clearValidators();
			}
			idViajeControl?.updateValueAndValidity();

			if (this.viajeSeleccionado?.transporteAsignado && this.viajeSeleccionado.transportes.length > 0) {
				const t = this.viajeSeleccionado.transportes[0];
				this.transporteForm.patchValue({
					tipoVehiculo: t.tipoTransporte,
					empresa: t.empresa,
					placa: t.placa,
					conductor: t.conductor,
					telefonoConductor: t.telefonoConductor,
					capacidad: String(t.capacidad),
					cantidadViajeros: String(t.cantidadViajeros),
					horarioSalida: this.viajeSeleccionado.fecha,
				});
			} else if (this.viajeSeleccionado) {
				this.transporteForm.patchValue({ horarioSalida: this.viajeSeleccionado.fecha });
			} else if (this.preloadData) {
				this.transporteForm.patchValue(this.preloadData);
			}
		}
	}

	// ==============================
	// CLICK FUERA: cierra dropdowns
	// ==============================

	onPanelClick(event: Event): void {
		event.stopPropagation();
		const target = event.target as HTMLElement;

		if (!target.closest('.custom-select')) {
			this.openSelect = null;
		}

		if (!target.closest('.cal-wrap') && !target.closest('app-custom-calendar')) {
			this.openCalendarSalida = false;
		}
	}

	// ==============================
	// VALIDACIONES EXTRA
	// ==============================

	capacidadSuficiente(): boolean {
		const cap = Number(this.transporteForm.get('capacidad')?.value || 0);
		const cant = Number(this.transporteForm.get('cantidadViajeros')?.value || 0);
		return cap >= cant;
	}

	// ==============================
	// GUARDAR
	// ==============================

	guardar(): void {
		this.formSubmitted = true;
		this.transporteForm.markAllAsTouched();

		if (this.transporteForm.invalid) return;

		const idViaje = this.viajeSeleccionado?.id || Number(this.transporteForm.value.idViaje);
		if (!idViaje) {
			this.saveFailed.emit('Selecciona un viaje');
			return;
		}

		this.showConfirmModal = true;
	}

	cerrarConfirmModal(): void {
		this.showConfirmModal = false;
	}

	confirmarGuardar(): void {
		this.showConfirmModal = false;
		this.enviarFormulario();
	}

	private enviarFormulario(): void {
		this.enviando = true;

		const v = this.transporteForm.value;
		const idViaje = this.viajeSeleccionado?.id || Number(v.idViaje);

		const body = {
			tipoTransporte: v.tipoVehiculo,
			empresa: v.empresa,
			placa: v.placa,
			conductor: v.conductor,
			telefonoConductor: v.telefonoConductor,
			capacidad: Number(v.capacidad),
			cantidadViajeros: Number(v.cantidadViajeros),
			fechaSalida: this.toLocalDateTime(v.horarioSalida || ''),
		};

		const request$ = this.editandoTransporteId
			? this.svc.actualizarTransporte(idViaje, this.editandoTransporteId, body)
			: this.svc.asignarTransporte(idViaje, body);

		const mensajeOk = this.editandoTransporteId
			? 'Transporte actualizado correctamente'
			: 'Transporte asignado correctamente';

		request$.subscribe({
			next: () => {
				this.enviando = false;
				this.saved.emit(mensajeOk);
			},
			error: (err) => {
				this.enviando = false;
				const campos = err?.error?.campos;
				const detalle = campos && Object.keys(campos).length > 0
					? ': ' + Object.values(campos).join(', ') : '';
				this.saveFailed.emit(
					(err?.error?.mensaje || err?.error?.message || 'Error al guardar transporte') + detalle
				);
			},
		});
	}

	private toLocalDateTime(fecha: string): string {
		if (!fecha) return '';
		if (fecha.length === 10) return fecha + 'T00:00:00';
		if (fecha.length === 16) return fecha + ':00';
		return fecha;
	}

	// ==============================
	// CERRAR
	// ==============================

	cerrar(): void {
		this.closed.emit();
	}
}