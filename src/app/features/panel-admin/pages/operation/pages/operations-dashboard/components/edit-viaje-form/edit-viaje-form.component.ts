import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../../../../../../core/services/auth.service';
import { OperacionesService } from '../../../../../../../../core/services/operaciones.service';

@Component({
	selector: 'app-edit-viaje-form',
	templateUrl: './edit-viaje-form.component.html',
	styleUrl: './edit-viaje-form.component.css'
})
export class EditViajeFormComponent implements OnInit, OnChanges {

	@Input() idViaje!: number;
	@Input() idPaquete!: number;
	@Input() fechaSalida = '';
	@Input() duracionDias = 1;

	@Output() cerrar = new EventEmitter<void>();
	@Output() guardarCambios = new EventEmitter<void>();

	editForm!: FormGroup;

	enviando = false;
	errorMsg = '';
	showConfirm = false;
	showToast = false;
	toastTitle = '';
	toastMessage = '';

	// Calendario
	showCalendarioSalida = false;

	// Custom time picker
	horaDropdownOpen = false;
	horaSeleccionada = '12';
	minutoSeleccionado = '00';
	periodoSeleccionado: 'AM' | 'PM' = 'AM';

	horasDisponibles = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
	minutosDisponibles = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
	periodosDisponibles: Array<'AM' | 'PM'> = ['AM', 'PM'];

	// Fecha regreso para mostrar
	fechaRegresoDisplay = '';

	constructor(
		private fb: FormBuilder,
		private operacionesService: OperacionesService,
		private authService: AuthService
	) { }

	ngOnInit(): void {
		this.editForm = this.fb.group({
			fechaSalida: ['', Validators.required],
			horaSalida: ['00:00', Validators.required],
			fechaRegreso: [''],
		});

		this.editForm.get('fechaSalida')?.valueChanges.subscribe(() => this.recalcularRegreso());
		this.editForm.get('horaSalida')?.valueChanges.subscribe(() => this.recalcularRegreso());
	}

	ngOnChanges(changes: SimpleChanges): void {
		if ((changes['fechaSalida'] || changes['duracionDias']) && this.editForm) {
			this.cargarDatos();
		}
	}

	private cargarDatos(): void {
		const [fecha = '', hora = '00:00'] = this.fechaSalida.substring(0, 16).split('T');
		this.syncHoraPickerFromValor(hora);
		this.editForm.patchValue({ fechaSalida: fecha, horaSalida: hora }, { emitEvent: false });
		this.recalcularRegreso();
		this.errorMsg = '';
	}

	private recalcularRegreso(): void {
		const fecha = this.editForm.get('fechaSalida')?.value as string;
		const hora = this.editForm.get('horaSalida')?.value as string || '00:00';
		if (!fecha) { this.fechaRegresoDisplay = ''; return; }

		const salidaISO = `${fecha}T${hora}`;
		const regresoISO = this.calcularFechaRegreso(salidaISO, this.duracionDias);
		this.editForm.patchValue({ fechaRegreso: regresoISO }, { emitEvent: false });

		const d = new Date(regresoISO);
		const dd = String(d.getDate()).padStart(2, '0');
		const mo = String(d.getMonth() + 1).padStart(2, '0');
		const yyyy = d.getFullYear();
		const hh2 = String(d.getHours()).padStart(2, '0');
		const min2 = String(d.getMinutes()).padStart(2, '0');
		this.fechaRegresoDisplay = `${dd}/${mo}/${yyyy} ${hh2}:${min2}`;
	}

	private calcularFechaRegreso(fechaSalida: string, duracionDias: number): string {
		if (!fechaSalida) return '';
		const fecha = new Date(fechaSalida);
		fecha.setDate(fecha.getDate() + (duracionDias || 1));
		const yyyy = fecha.getFullYear();
		const mm = String(fecha.getMonth() + 1).padStart(2, '0');
		const dd = String(fecha.getDate()).padStart(2, '0');
		const hh = String(fecha.getHours()).padStart(2, '0');
		const min = String(fecha.getMinutes()).padStart(2, '0');
		return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
	}

	// ==============================
	// CALENDARIO
	// ==============================

	toggleCalendarioSalida(event: Event): void {
		event.stopPropagation();
		this.showCalendarioSalida = !this.showCalendarioSalida;
		this.horaDropdownOpen = false;
	}

	onFechaSalidaSelected(date: string): void {
		this.showCalendarioSalida = false;
		this.editForm.patchValue({ fechaSalida: date });
		this.editForm.get('fechaSalida')?.markAsTouched();
	}

	// ==============================
	// CUSTOM TIME PICKER
	// ==============================

	toggleHoraDropdown(event: Event): void {
		event.stopPropagation();
		const abrir = !this.horaDropdownOpen;
		if (abrir) {
			const hora = this.editForm.get('horaSalida')?.value as string || '00:00';
			this.syncHoraPickerFromValor(hora);
		}
		this.horaDropdownOpen = abrir;
		this.showCalendarioSalida = false;
	}

	seleccionarHora(h: string): void {
		this.horaSeleccionada = h;
		this.aplicarHora();
	}

	seleccionarMinuto(m: string): void {
		this.minutoSeleccionado = m;
		this.aplicarHora();
	}

	seleccionarPeriodo(periodo: 'AM' | 'PM'): void {
		this.periodoSeleccionado = periodo;
		this.aplicarHora();
	}

	getHoraSalidaDisplay(): string {
		const hora = this.editForm.get('horaSalida')?.value as string;
		if (!hora) return '';
		const { h, m, periodo } = this.parse24hTo12(hora);
		return `${h}:${m} ${periodo}`;
	}

	private aplicarHora(): void {
		const valor = this.to24h(this.horaSeleccionada, this.minutoSeleccionado, this.periodoSeleccionado);
		this.editForm.patchValue({ horaSalida: valor });
		this.editForm.get('horaSalida')?.markAsTouched();
		this.horaDropdownOpen = false;
	}

	private syncHoraPickerFromValor(hora24: string): void {
		const { h, m, periodo } = this.parse24hTo12(hora24 || '00:00');
		this.horaSeleccionada = h;
		this.minutoSeleccionado = m;
		this.periodoSeleccionado = periodo;
	}

	private parse24hTo12(hora24: string): { h: string; m: string; periodo: 'AM' | 'PM' } {
		const [hh = '00', mm = '00'] = hora24.split(':');
		const h24 = parseInt(hh, 10) || 0;
		const periodo: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
		let h12 = h24 % 12;
		if (h12 === 0) h12 = 12;
		return {
			h: String(h12).padStart(2, '0'),
			m: mm.padStart(2, '0'),
			periodo
		};
	}

	private to24h(h12: string, mm: string, periodo: 'AM' | 'PM'): string {
		let h = parseInt(h12, 10) || 12;
		if (periodo === 'AM') {
			if (h === 12) h = 0;
		} else if (h !== 12) {
			h += 12;
		}
		return `${String(h).padStart(2, '0')}:${mm.padStart(2, '0')}`;
	}

	// ==============================
	// PANEL CLICK — cierra dropdowns
	// ==============================

	onPanelClick(event: Event): void {
		event.stopPropagation();
		const target = event.target as HTMLElement;
		if (!target.closest('.cal-wrap') && !target.closest('.hora-wrap')) {
			this.showCalendarioSalida = false;
			this.horaDropdownOpen = false;
		}
	}

	// ==============================
	// GUARDAR
	// ==============================

	abrirConfirmacion(): void {
		if (this.editForm.invalid) {
			this.editForm.markAllAsTouched();
			return;
		}
		this.showConfirm = true;
	}

	guardar(): void {
		if (this.editForm.invalid) {
			this.editForm.markAllAsTouched();
			return;
		}

		const usuario = this.authService.getUser();
		if (!usuario?.id) {
			this.errorMsg = 'No se pudo obtener el usuario activo.';
			this.showConfirm = false;
			return;
		}

		this.enviando = true;
		this.errorMsg = '';

		const { fechaSalida, horaSalida, fechaRegreso } = this.editForm.getRawValue();

		this.operacionesService.actualizarViaje(this.idViaje, {
			idUsuario: usuario.id,
			idPaquete: this.idPaquete,
			fechaSalida: `${fechaSalida}T${horaSalida}`,
			fechaRegreso,
		}).subscribe({
			next: () => {
				this.enviando = false;
				this.showConfirm = false;
				this.guardarCambios.emit();
			},
			error: (err) => {
				this.enviando = false;
				this.showConfirm = false;
				this.errorMsg = err?.error?.mensaje ?? err?.error?.message ?? 'Error al actualizar el viaje.';
				this.mostrarToast('Error', this.errorMsg);
			}
		});
	}

	cerrarModal(): void {
		if (this.enviando) return;
		this.errorMsg = '';
		this.cerrar.emit();
	}

	private mostrarToast(title: string, message: string): void {
		this.toastTitle = title;
		this.toastMessage = message;
		this.showToast = true;
		setTimeout(() => { this.showToast = false; }, 3000);
	}
}