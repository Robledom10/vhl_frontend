import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { OperacionesService } from '../../../../../../../../core/services/operaciones.service';
import { AuthService } from '../../../../../../../../core/services/auth.service';
import { RespuestaProveedor } from '../../../../../../models/package.model';
import { ViajeAlojamientoDisplay, UsuarioDisplay } from '../../../../models/operaciones-display.models';

@Component({
	selector: 'app-form-assign-accommodation',
	templateUrl: './form-assign-accommodation.component.html',
	styleUrl: './form-assign-accommodation.component.css',
})
export class FormAssignAccommodationComponent implements OnChanges {
	@Input() isOpen = false;
	@Input() viajes: ViajeAlojamientoDisplay[] = [];
	@Input() viajeSeleccionado: ViajeAlojamientoDisplay | null = null;
	@Input() editandoId: number | null = null;
	@Input() proveedores: RespuestaProveedor[] = [];
	@Input() usuarios: UsuarioDisplay[] = [];
	@Input() preloadData: { nombreHotel?: string; direccion?: string } | null = null;

	@Output() closed = new EventEmitter<void>();
	@Output() saved = new EventEmitter<string>();
	@Output() saveFailed = new EventEmitter<string>();

	enviando = false;
	showCalendarCheckIn = false;
	showCalendarCheckOut = false;

	// Confirmación de guardado
	showConfirmModal = false;

	alojamientoForm = this.fb.group({
		idViaje: [''],
		nombreViajero: [''],
		nombreHotel: ['', [Validators.required, Validators.minLength(3)]],
		habitacion: ['', Validators.required],
		direccion: ['', Validators.required],
		checkIn: ['', Validators.required],
		checkOut: ['', Validators.required],
	});

	constructor(
		private fb: FormBuilder,
		private svc: OperacionesService,
		private authSvc: AuthService,
	) { }

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['isOpen'] && this.isOpen) {
			this.showCalendarCheckIn = false;
			this.showCalendarCheckOut = false;
			this.alojamientoForm.reset();

			if (this.viajeSeleccionado?.alojamientoAsignado) {
				const v = this.viajeSeleccionado;
				this.alojamientoForm.patchValue({
					nombreViajero: v.viajeroNombre || '',
					nombreHotel: v.hotel || '',
					habitacion: v.habitacion || '',
					direccion: v.direccion || '',
					checkIn: v.alojamientoFechaIngreso?.substring(0, 10) || '',
					checkOut: v.alojamientoFechaSalida?.substring(0, 10) || '',
				});
			} else if (this.preloadData) {
				this.alojamientoForm.patchValue(this.preloadData);
			}
		}
	}

	seleccionarProveedorAlojamiento(event: Event): void {
		const id = Number((event.target as HTMLSelectElement).value);
		if (!id) return;
		const p = this.proveedores.find(x => x.id === id);
		if (!p) return;
		this.alojamientoForm.patchValue({
			nombreHotel: p.nombre,
			direccion: p.direccion || '',
		});
	}

	onCheckInSelected(date: string): void {
		this.showCalendarCheckIn = false;
		this.alojamientoForm.patchValue({ checkIn: date });
	}

	onCheckOutSelected(date: string): void {
		this.showCalendarCheckOut = false;
		this.alojamientoForm.patchValue({ checkOut: date });
	}

	cerrar(): void {
		this.closed.emit();
	}

	// =========================================
	// VALIDAR Y ABRIR CONFIRMACIÓN
	// =========================================

	guardar(): void {
		if (this.alojamientoForm.invalid) {
			this.alojamientoForm.markAllAsTouched();
			return;
		}

		const idViaje = this.viajeSeleccionado?.id || Number(this.alojamientoForm.value.idViaje);
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

		const v = this.alojamientoForm.value;
		const idViaje = this.viajeSeleccionado?.id || Number(v.idViaje);

		const nombreDigitado = (v.nombreViajero || '').trim().toLowerCase();
		const encontrado = nombreDigitado
			? this.usuarios.find(u =>
				`${u.firstName} ${u.lastName}`.toLowerCase() === nombreDigitado ||
				u.firstName.toLowerCase() === nombreDigitado
			)
			: null;
		const idViajero = encontrado?.id ?? (this.authSvc.getUser()?.id ?? 1);
		const nombreViajero = (v.nombreViajero || '').trim() || null;

		const body = {
			idViajero,
			nombreViajero,
			hotel: v.nombreHotel,
			habitacion: v.habitacion,
			direccion: v.direccion,
			fechaIngreso: v.checkIn,
			fechaSalida: v.checkOut,
		};

		const request$ = this.editandoId
			? this.svc.actualizarAlojamiento(idViaje, this.editandoId, body)
			: this.svc.asignarAlojamiento(idViaje, body);

		request$.subscribe({
			next: () => {
				this.enviando = false;
				const msg = this.editandoId
					? 'Alojamiento actualizado correctamente'
					: 'Alojamiento asignado correctamente';
				this.saved.emit(msg);
			},
			error: (err) => {
				this.enviando = false;
				const campos = err?.error?.campos;
				const detalle = campos && Object.keys(campos).length > 0
					? ': ' + Object.values(campos).join(', ') : '';
				this.saveFailed.emit(
					(err?.error?.mensaje || err?.error?.message || 'Error al guardar alojamiento') + detalle
				);
			},
		});
	}
}