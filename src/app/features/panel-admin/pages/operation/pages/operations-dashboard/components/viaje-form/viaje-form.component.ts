import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../../../../../../core/services/auth.service';
import { OperacionesService } from '../../../../../../../../core/services/operaciones.service';

@Component({
	selector: 'app-viaje-form',
	templateUrl: './viaje-form.component.html',
	styleUrl: './viaje-form.component.css'
})
export class ViajeFormComponent implements OnInit, OnChanges {

	@Input() visible = false;

	@Input() paquetes: {
		id: number;
		titulo: string;
		destino: string;
		duracionDias: number;
	}[] = [];

	@Output() cerrar = new EventEmitter<void>();
	@Output() crear = new EventEmitter<void>();

	viajeForm!: FormGroup;

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

	fechaRegresoDisplay = '';

	// Custom select — paquete
	paqueteDropdownOpen = false;
	selectedPaqueteId: number | '' = '';

	constructor(
		private fb: FormBuilder,
		private operacionesService: OperacionesService,
		private authService: AuthService
	) { }

	ngOnInit(): void {
		this.viajeForm = this.fb.group({
			idPaquete: ['', Validators.required],
			fechaSalida: ['', Validators.required],
			horaSalida: ['00:00', Validators.required],
			fechaRegreso: ['']
		});

		this.suscribirCambios();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['visible'] && this.visible && this.viajeForm) {
			this.resetFormulario();
		}
	}

	private suscribirCambios(): void {
		this.viajeForm.get('idPaquete')?.valueChanges.subscribe(() => this.actualizarFechaRegreso());
		this.viajeForm.get('fechaSalida')?.valueChanges.subscribe(() => this.actualizarFechaRegreso());
		this.viajeForm.get('horaSalida')?.valueChanges.subscribe(() => this.actualizarFechaRegreso());
	}

	private getFechaSalidaCompleta(): string {
		const fecha = this.viajeForm.get('fechaSalida')?.value as string;
		const hora = this.viajeForm.get('horaSalida')?.value as string || '00:00';
		if (!fecha) return '';
		return `${fecha}T${hora}`;
	}

	private actualizarFechaRegreso(): void {
		const idPaquete = Number(this.viajeForm.value.idPaquete);
		const fechaSalidaCompleta = this.getFechaSalidaCompleta();

		if (!idPaquete || !fechaSalidaCompleta) {
			this.fechaRegresoDisplay = '';
			this.viajeForm.patchValue({ fechaRegreso: '' }, { emitEvent: false });
			return;
		}

		const paquete = this.paquetes.find(p => p.id === idPaquete);
		if (!paquete) return;

		const fechaRegreso = this.calcularFechaRegreso(fechaSalidaCompleta, paquete.duracionDias);
		this.viajeForm.patchValue({ fechaRegreso }, { emitEvent: false });
		this.actualizarDisplayRegreso(fechaRegreso);
	}

	private actualizarDisplayRegreso(regresoISO: string): void {
		if (!regresoISO) {
			this.fechaRegresoDisplay = '';
			return;
		}
		const d = new Date(regresoISO);
		const dd = String(d.getDate()).padStart(2, '0');
		const mo = String(d.getMonth() + 1).padStart(2, '0');
		const yyyy = d.getFullYear();
		const hh = String(d.getHours()).padStart(2, '0');
		const min = String(d.getMinutes()).padStart(2, '0');
		this.fechaRegresoDisplay = `${dd}/${mo}/${yyyy} ${hh}:${min}`;
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
	// CUSTOM SELECT — PAQUETE
	// ==============================

	togglePaqueteDropdown(event: Event): void {
		event.stopPropagation();
		this.paqueteDropdownOpen = !this.paqueteDropdownOpen;
		this.showCalendarioSalida = false;
		this.horaDropdownOpen = false;
	}

	selectPaqueteOption(paquete: { id: number; titulo: string; destino: string; duracionDias: number }): void {
		this.selectedPaqueteId = paquete.id;
		this.viajeForm.patchValue({ idPaquete: paquete.id });
		this.viajeForm.get('idPaquete')?.markAsTouched();
		this.paqueteDropdownOpen = false;
	}

	getPaqueteLabel(id: number | ''): string {
		const paquete = this.paquetes.find(p => p.id === id);
		return paquete ? `${paquete.titulo} — ${paquete.destino}` : '';
	}

	// ==============================
	// CALENDARIO
	// ==============================

	toggleCalendarioSalida(event: Event): void {
		event.stopPropagation();
		this.showCalendarioSalida = !this.showCalendarioSalida;
		this.horaDropdownOpen = false;
		this.paqueteDropdownOpen = false;
	}

	onFechaSalidaSelected(date: string): void {
		this.showCalendarioSalida = false;
		this.viajeForm.patchValue({ fechaSalida: date });
		this.viajeForm.get('fechaSalida')?.markAsTouched();
	}

	// ==============================
	// CUSTOM TIME PICKER
	// ==============================

	toggleHoraDropdown(event: Event): void {
		event.stopPropagation();
		const abrir = !this.horaDropdownOpen;
		if (abrir) {
			const hora = this.viajeForm.get('horaSalida')?.value as string || '00:00';
			this.syncHoraPickerFromValor(hora);
		}
		this.horaDropdownOpen = abrir;
		this.showCalendarioSalida = false;
		this.paqueteDropdownOpen = false;
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
		const hora = this.viajeForm.get('horaSalida')?.value as string;
		if (!hora) return '';
		const { h, m, periodo } = this.parse24hTo12(hora);
		return `${h}:${m} ${periodo}`;
	}

	private aplicarHora(): void {
		const valor = this.to24h(this.horaSeleccionada, this.minutoSeleccionado, this.periodoSeleccionado);
		this.viajeForm.patchValue({ horaSalida: valor });
		this.viajeForm.get('horaSalida')?.markAsTouched();
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

	onPanelClick(event: Event): void {
		event.stopPropagation();
		const target = event.target as HTMLElement;

		if (!target.closest('.custom-select')) {
			this.paqueteDropdownOpen = false;
		}

		if (!target.closest('.cal-wrap') && !target.closest('.hora-wrap')) {
			this.showCalendarioSalida = false;
			this.horaDropdownOpen = false;
		}
	}

	guardar(): void {
		if (this.viajeForm.invalid) {
			this.viajeForm.markAllAsTouched();
			return;
		}

		const usuario = this.authService.getUser();
		if (!usuario?.id) {
			this.errorMsg = 'No se pudo obtener el usuario activo.';
			this.showConfirm = false;
			return;
		}

		const formulario = this.viajeForm.getRawValue();
		const paquete = this.paquetes.find(p => p.id === Number(formulario.idPaquete));

		if (!paquete) {
			this.errorMsg = 'Paquete inválido.';
			this.showConfirm = false;
			return;
		}

		const fechaSalida = `${formulario.fechaSalida}T${formulario.horaSalida}`;
		const fechaRegreso = this.calcularFechaRegreso(fechaSalida, paquete.duracionDias);

		this.viajeForm.patchValue({ fechaRegreso }, { emitEvent: false });

		this.enviando = true;
		this.errorMsg = '';

		this.operacionesService.crearViaje({
			idUsuario: usuario.id,
			idPaquete: Number(formulario.idPaquete),
			fechaSalida,
			fechaRegreso
		}).subscribe({
			next: () => {
				this.enviando = false;
				this.showConfirm = false;
				this.crear.emit();
				this.resetFormulario();
			},
			error: (err) => {
				this.enviando = false;
				this.showConfirm = false;
				this.errorMsg = err?.error?.mensaje ?? err?.error?.message ?? 'Error al crear el viaje.';
				this.mostrarToast('Error', this.errorMsg);
			}
		});
	}

	abrirConfirmacion(): void {
		if (this.viajeForm.invalid) {
			this.viajeForm.markAllAsTouched();
			return;
		}
		this.showConfirm = true;
	}

	private mostrarToast(title: string, message: string): void {
		this.toastTitle = title;
		this.toastMessage = message;
		this.showToast = true;
		setTimeout(() => { this.showToast = false; }, 3000);
	}

	resetFormulario(): void {
		this.errorMsg = '';
		this.showCalendarioSalida = false;
		this.horaDropdownOpen = false;
		this.paqueteDropdownOpen = false;
		this.selectedPaqueteId = '';
		this.horaSeleccionada = '12';
		this.minutoSeleccionado = '00';
		this.periodoSeleccionado = 'AM';
		this.fechaRegresoDisplay = '';

		this.viajeForm.reset({
			idPaquete: '',
			fechaSalida: '',
			horaSalida: '00:00',
			fechaRegreso: ''
		});
	}

	cerrarModal(): void {
		if (this.enviando) return;
		this.resetFormulario();
		this.cerrar.emit();
	}
}