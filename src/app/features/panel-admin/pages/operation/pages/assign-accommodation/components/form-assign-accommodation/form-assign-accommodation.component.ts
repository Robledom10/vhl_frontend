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
	formSubmitted = false;

	showCalendarCheckIn = false;
	showCalendarCheckOut = false;

	// Dropdowns
	viajeDropdownOpen = false;
	usuarioDropdownOpen = false;
	proveedorDropdownOpen = false;

	selectedViajeLabel = '';
	selectedUsuarioLabel = '';
	selectedProveedorLabel = '';
	selectedProveedorId: number | null = null;

	usuarioSeleccionadoId: number | null = null;

	// Confirmación
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
			this.usuarioSeleccionadoId = null;
			this.formSubmitted = false;

			// Reset dropdowns
			this.viajeDropdownOpen = false;
			this.usuarioDropdownOpen = false;
			this.proveedorDropdownOpen = false;
			this.selectedViajeLabel = '';
			this.selectedUsuarioLabel = '';
			this.selectedProveedorLabel = '';
			this.selectedProveedorId = null;

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

	// ==============================
	// DROPDOWNS
	// ==============================

	toggleViajeDropdown(): void {
		this.viajeDropdownOpen = !this.viajeDropdownOpen;
		this.usuarioDropdownOpen = false;
		this.proveedorDropdownOpen = false;
	}

	toggleUsuarioDropdown(): void {
		this.usuarioDropdownOpen = !this.usuarioDropdownOpen;
		this.viajeDropdownOpen = false;
		this.proveedorDropdownOpen = false;
	}

	toggleProveedorDropdown(): void {
		this.proveedorDropdownOpen = !this.proveedorDropdownOpen;
		this.viajeDropdownOpen = false;
		this.usuarioDropdownOpen = false;
	}

	selectViaje(v: ViajeAlojamientoDisplay): void {
		this.alojamientoForm.patchValue({ idViaje: String(v.id) });
		this.selectedViajeLabel = v.nombre || v.titulo || '';
		this.viajeDropdownOpen = false;
	}

	// ==============================
	// USUARIO
	// ==============================

	onUsuarioChange(idStr: string): void {
		const id = idStr ? +idStr : null;
		this.usuarioSeleccionadoId = id;
		this.usuarioDropdownOpen = false;

		if (!id) {
			this.selectedUsuarioLabel = '';
			this.alojamientoForm.patchValue({ nombreViajero: '' });
			return;
		}

		const usuario = this.usuarios.find(u => u.id === id);
		if (usuario) {
			const nombre = `${usuario.firstName} ${usuario.lastName}`.trim();
			this.selectedUsuarioLabel = nombre;
			this.alojamientoForm.patchValue({ nombreViajero: nombre });
		}
	}

	// ==============================
	// PROVEEDOR
	// ==============================

	seleccionarProveedorAlojamiento2(p: RespuestaProveedor): void {
		this.selectedProveedorId = p.id;
		this.selectedProveedorLabel = p.nombre;
		this.proveedorDropdownOpen = false;
		this.alojamientoForm.patchValue({
			nombreHotel: p.nombre,
			direccion: p.direccion || '',
		});
	}

	// Mantiene compatibilidad con el método original basado en evento nativo
	seleccionarProveedorAlojamiento(event: Event): void {
		const id = Number((event.target as HTMLSelectElement).value);
		if (!id) return;
		const p = this.proveedores.find(x => x.id === id);
		if (p) this.seleccionarProveedorAlojamiento2(p);
	}

	clearProveedor(): void {
		this.selectedProveedorId = null;
		this.selectedProveedorLabel = '';
		this.proveedorDropdownOpen = false;
	}

	// ==============================
	// CALENDARIO
	// ==============================

	toggleCheckIn(event: Event): void {
		event.stopPropagation();
		this.showCalendarCheckIn = !this.showCalendarCheckIn;
		this.showCalendarCheckOut = false;
	}

	toggleCheckOut(event: Event): void {
		event.stopPropagation();
		this.showCalendarCheckOut = !this.showCalendarCheckOut;
		this.showCalendarCheckIn = false;
	}

	onCheckInSelected(date: string): void {
		this.showCalendarCheckIn = false;
		this.alojamientoForm.patchValue({ checkIn: date });
		this.alojamientoForm.get('checkIn')?.markAsTouched();
	}

	onCheckOutSelected(date: string): void {
		this.showCalendarCheckOut = false;
		this.alojamientoForm.patchValue({ checkOut: date });
		this.alojamientoForm.get('checkOut')?.markAsTouched();
	}

	// ==============================
	// CLICK FUERA: cierra dropdowns
	// ==============================

	onModalClick(event: Event): void {
		event.stopPropagation();
		const target = event.target as HTMLElement;
		if (!target.closest('.custom-select')) {
			this.viajeDropdownOpen = false;
			this.usuarioDropdownOpen = false;
			this.proveedorDropdownOpen = false;
		}
	}

	// ==============================
	// GUARDAR
	// ==============================

	guardar(): void {
		this.formSubmitted = true;
		this.alojamientoForm.markAllAsTouched();

		if (this.alojamientoForm.invalid) return;

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
		const idViajero = this.usuarioSeleccionadoId ?? (this.authSvc.getUser()?.id ?? 1);
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

	// ==============================
	// CERRAR
	// ==============================

	cerrar(): void {
		this.closed.emit();
	}
}