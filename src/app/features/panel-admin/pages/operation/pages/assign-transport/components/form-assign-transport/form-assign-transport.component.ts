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

	// Confirmación de guardado
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

	constructor(private fb: FormBuilder, private svc: OperacionesService,) { }

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['isOpen'] && this.isOpen) {
			this.transporteForm.reset();

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

	seleccionarProveedorTransporte(event: Event): void {
		const id = Number((event.target as HTMLSelectElement).value);
		if (!id) return;
		const p = this.proveedores.find(x => x.id === id);
		if (!p) return;
		this.transporteForm.patchValue({
			empresa: p.nombre,
			tipoVehiculo: p.tipoVehiculo || '',
			placa: p.placa || '',
			conductor: p.conductor || '',
			telefonoConductor: p.telefonoConductor || p.telefono || '',
			capacidad: p.capacidad ? String(p.capacidad) : '',
		});
	}

	onViajeChange(event: Event): void {
		const idViaje = Number((event.target as HTMLSelectElement).value);
		const viaje = this.viajes.find(v => v.id === idViaje);
		if (viaje) {
			this.transporteForm.patchValue({ horarioSalida: viaje.fecha });
		}
	}

	capacidadSuficiente(): boolean {
		const cap = Number(this.transporteForm.get('capacidad')?.value || 0);
		const cant = Number(this.transporteForm.get('cantidadViajeros')?.value || 0);
		return cap >= cant;
	}

	private toLocalDateTime(fecha: string): string {
		if (!fecha) return '';
		if (fecha.length === 10) return fecha + 'T00:00:00';
		if (fecha.length === 16) return fecha + ':00';
		return fecha;
	}

	cerrar(): void {
		this.closed.emit();
	}

	// =========================================
	// VALIDAR Y ABRIR CONFIRMACIÓN
	// =========================================

	guardar(): void {
		if (this.transporteForm.invalid) {
			this.transporteForm.markAllAsTouched();
			return;
		}

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

		const rawFecha = v.horarioSalida || '';
		const body = {
			tipoTransporte: v.tipoVehiculo,
			empresa: v.empresa,
			placa: v.placa,
			conductor: v.conductor,
			telefonoConductor: v.telefonoConductor,
			capacidad: Number(v.capacidad),
			cantidadViajeros: Number(v.cantidadViajeros),
			fechaSalida: this.toLocalDateTime(rawFecha),
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
				const detalle = campos && Object.keys(campos).length > 0 ? ': ' + Object.values(campos).join(', ') : '';
				this.saveFailed.emit(
					(err?.error?.mensaje || err?.error?.message || 'Error al guardar transporte') + detalle
				);
			},
		});
	}
}