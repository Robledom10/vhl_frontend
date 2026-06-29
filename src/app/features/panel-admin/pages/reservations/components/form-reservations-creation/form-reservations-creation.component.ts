import { Component, Input, Output, EventEmitter, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Reservation } from '../../models/reservations.models';
import { ReservationService, SolicitudReserva } from '../../../../../../core/services/reservation.service';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { PackageService } from '../../../../../../core/services/package.service';

// ─── Modelos ─────────────────────────────────────────────────

export interface Acompanante {
	nombre: string;
	fechaNacimiento: string;
	tipoDocumento: string;
	documento: string;
}

export interface ContactoEmergenciaForm {
	nombre: string;
	parentesco: string;
	telefono: string;
	correo: string;
}

export interface ReservationForm {
	idUsuario: number | '';
	personas: number | '';
	acompanantes: Acompanante[];
	contactosEmergencia: ContactoEmergenciaForm[];
	idViaje: number | '';
	paqueteNombre: string;
	destino: string;
	fechaSalida: string;
	fechaRegreso: string;
	duracion: string;
	tipoHabitacion: string;
	solicitudEspecial: string;
	notas: string;
	total: number | '';
	aceptaTerminos: boolean;
	aceptaPolitica: boolean;
}

export interface ViajeOption {
	id: number;
	idPaquete: number;
	paqueteNombre: string;
	destino: string;
	fechaSalida: string;
	fechaRegreso: string;
	precio: number;
}

// ─── Animaciones ──────────────────────────────────────────────

const slideIn = trigger('slideIn', [
	transition(':enter', [
		style({ opacity: 0, transform: 'scale(0.96) translateY(16px)' }),
		animate('320ms cubic-bezier(.4,0,.2,1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
	]),
]);

const fadeStep = trigger('fadeStep', [
	transition(':enter', [
		style({ opacity: 0, transform: 'translateX(18px)' }),
		animate('260ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
	]),
	transition(':leave', [
		animate('180ms ease-in', style({ opacity: 0, transform: 'translateX(-18px)' })),
	]),
]);

const expandDown = trigger('expandDown', [
	transition(':enter', [
		style({ opacity: 0, transform: 'translateY(-10px)' }),
		animate('280ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
	]),
	transition(':leave', [
		animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' })),
	]),
]);

// ─── Componente ───────────────────────────────────────────────

@Component({
	selector: 'app-form-reservation-creation',
	templateUrl: './form-reservations-creation.component.html',
	styleUrl: './form-reservations-creation.component.css',
	animations: [slideIn, fadeStep, expandDown],
})
export class FormReservationsCreationComponent implements OnChanges, OnInit {

	@Input() isOpen = false;
	@Input() mode: 'existing' | 'new' = 'existing';
	@Input() prefilledDocument: string | null = null;
	@Output() closed = new EventEmitter<void>();
	@Output() reservationCreated = new EventEmitter<Reservation>();

	constructor(
		private reservationService: ReservationService,
		private operacionesService: OperacionesService,
		private authService: AuthService,
		private packageService: PackageService
	) { }

	currentStep = 1;
	steps = ['Datos del cliente', 'Datos del viaje', 'Contactos y confirmación'];
	submitted = false;
	isSaving = false;
	saveError = '';

	viajesDisponibles: ViajeOption[] = [];
	viajesFiltrados: ViajeOption[] = [];
	paquetesDisponibles: { id: number; nombre: string }[] = [];
	selectedPaqueteId: number | '' = '';
	cargandoViajes = false;
	errorViajes = false;

	// ─── Cliente ────────────────────────────────────────────
	documentoBusqueda = '';
	nombreClienteSeleccionado = '';
	apellidoCliente = '';
	tipoDocumentoCliente = '';
	telefonoCliente = '';
	ciudadCliente = '';
	correoCliente = '';
	buscandoCliente = false;
	errorCliente = false;
	errorSelfReservation = false;
	// ------------------------------------------
	// ─── Confirmación / Toast ────────────────────────────────
	showConfirmModal = false;
	pendingSolicitud: SolicitudReserva | null = null;
	showToast = false;
	toastTitle = '';
	toastMsg = '';
	toastType: 'success' | 'error' = 'success';


	form: ReservationForm = this.emptyForm();

	// =========================================================
	// DATOS ESTÁTICOS para los custom selects
	// =========================================================

	tiposDocumento = [
		{ value: 'CC', label: 'Cédula de ciudadanía' },
		{ value: 'CE', label: 'Cédula extranjería' },
		{ value: 'PA', label: 'Pasaporte' },
		{ value: 'TI', label: 'Tarjeta de identidad' },
		{ value: 'RC', label: 'Registro civil' },
	];

	tiposHabitacion = ['Individual', 'Doble', 'Triple', 'Familiar', 'Suite'];

	solicitudesEspeciales = [
		'Ninguna',
		'Alimentación vegana',
		'Alimentación vegetariana',
		'Sin gluten',
		'Silla de ruedas',
		'Cama extra',
		'Cuna para bebé',
	];

	// =========================================================
	// DROPDOWN MANAGER — un único key activo a la vez
	// =========================================================

	private openDropdown: string | null = null;

	toggleDropdown(key: string, event?: Event): void {
		event?.stopPropagation();
		this.openDropdown = this.openDropdown === key ? null : key;
	}

	isDropdownOpen(key: string): boolean {
		return this.openDropdown === key;
	}

	closeDropdown(): void {
		this.openDropdown = null;
	}

	// =========================================================
	// CALENDARIO ACOMPAÑANTES
	// =========================================================

	openCalendarAcompanante = -1;  // índice del acompañante con calendario abierto; -1 = ninguno

	toggleCalendarAcompanante(i: number, event?: Event): void {
		event?.stopPropagation();
		this.openCalendarAcompanante = this.openCalendarAcompanante === i ? -1 : i;
		this.closeDropdown();
	}

	onFechaNacimientoSelected(i: number, date: string): void {
		this.form.acompanantes[i].fechaNacimiento = date;
		this.openCalendarAcompanante = -1;
	}

	// =========================================================
	// SELECCIONES en los custom selects
	// =========================================================

	selectPersonas(n: number): void {
		this.onPersonasChange(n);
		this.form.personas = n;
		this.closeDropdown();
	}

	selectTipoDocAcompanante(i: number, value: string): void {
		this.form.acompanantes[i].tipoDocumento = value;
		this.closeDropdown();
	}

	getTipoDocLabel(value: string): string {
		return this.tiposDocumento.find(t => t.value === value)?.label ?? value;
	}

	getPaqueteLabel(id: number | ''): string {
		return this.paquetesDisponibles.find(p => p.id === id)?.nombre ?? '';
	}

	getViajeLabel(id: number | ''): string {
		const v = this.viajesDisponibles.find(v => v.id === id);
		return v ? `${v.fechaSalida} → ${v.fechaRegreso}` : '';
	}

	// =========================================================
	// CLICK HANDLER — cierra dropdowns/calendarios al clicar fuera
	// =========================================================

	onModalClick(event: Event): void {
		event.stopPropagation();
		const target = event.target as HTMLElement;
		if (!target.closest('.custom-select') && !target.closest('.custom-select-dropdown')) {
			this.openDropdown = null;
		}
		if (!target.closest('.cal-wrap') && !target.closest('app-custom-calendar')) {
			this.openCalendarAcompanante = -1;
		}
	}

	// =========================================================
	// LIFECYCLE
	// =========================================================

	ngOnInit(): void {
		this.cargarViajes();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['isOpen']?.currentValue === true) {
			this.resetForm();
			if (this.paquetesDisponibles.length === 0 || this.errorViajes) {
				this.cargarViajes();
			}
			if (this.mode === 'new' && this.prefilledDocument) {
				this.documentoBusqueda = this.prefilledDocument;
				this.buscarCliente();
			}
		}
	}

	// =========================================================
	// CLIENTE
	// =========================================================

	buscarCliente(): void {
		if (!this.documentoBusqueda?.trim()) {
			this.resetDatosCliente();
			return;
		}
		this.buscandoCliente = true;
		this.errorCliente = false;
		this.errorSelfReservation = false;

		this.authService.getUserByDocumento(this.documentoBusqueda.trim()).subscribe({
			next: (usuario: any) => {
				this.buscandoCliente = false;
				if (usuario?.id) {
					const currentUser = this.authService.getUser();
					const isAdminOrGuide = currentUser?.role === 'ADMIN' || currentUser?.role === 'GUIDE';
					if (isAdminOrGuide && usuario.id === currentUser?.id) {
						this.errorSelfReservation = true;
						this.resetDatosCliente();
						return;
					}
					this.form.idUsuario = usuario.id;
					this.nombreClienteSeleccionado = `${usuario.firstName ?? ''} ${usuario.lastName ?? ''}`.trim();
					this.apellidoCliente = usuario.lastName ?? '';
					this.tipoDocumentoCliente = usuario.documentType ?? '';
					this.telefonoCliente = usuario.phone ?? '';
					this.ciudadCliente = usuario.city ?? '';
					this.correoCliente = usuario.email ?? '';
				} else {
					this.errorCliente = true;
					this.resetDatosCliente();
				}
			},
			error: () => {
				this.buscandoCliente = false;
				this.errorCliente = true;
				this.resetDatosCliente();
			},
		});
	}

	private resetDatosCliente(): void {
		this.form.idUsuario = '';
		this.nombreClienteSeleccionado = '';
		this.apellidoCliente = '';
		this.tipoDocumentoCliente = '';
		this.telefonoCliente = '';
		this.ciudadCliente = '';
		this.correoCliente = '';
	}

	// =========================================================
	// VIAJES / PAQUETES
	// =========================================================

	cargarViajes(): void {
		this.cargandoViajes = true;
		this.errorViajes = false;

		forkJoin({
			viajes: this.operacionesService.getViajes().pipe(
				map((res: any) => Array.isArray(res) ? res : (res?.content ?? [])),
				catchError(() => of([]))
			),
			paquetes: this.packageService.getPackages({ tamano: 100 }).pipe(
				map((res: any) => Array.isArray(res) ? res : (res?.content ?? [])),
				catchError(() => of([]))
			),
		}).subscribe({
			next: ({ viajes, paquetes }) => {
				try {
					const filtrados = (viajes as any[]).filter(v => {
						const e = (v?.estado ?? '').toUpperCase();
						return e !== 'CANCELADO' && e !== 'FINALIZADO';
					});
					const paqueteMap = new Map((paquetes as any[]).map(p => [p.id, p]));

					this.viajesDisponibles = filtrados.map(v => {
						const pkg = (paqueteMap.get(v.idPaquete) ?? {}) as any;
						return {
							id: v.id,
							idPaquete: v.idPaquete,
							paqueteNombre: pkg.titulo ?? `Paquete ${v.idPaquete}`,
							destino: pkg.destino ?? '',
							fechaSalida: v.fechaSalida,
							fechaRegreso: v.fechaRegreso,
							precio: pkg.precio ?? 0,
						};
					});

					this.paquetesDisponibles = (paquetes as any[]).map(p => ({ id: p.id, nombre: p.titulo }));
				} catch (err) {
					console.error('[ReservaForm] Error procesando datos:', err);
				} finally {
					this.cargandoViajes = false;
				}
			},
			error: () => {
				this.cargandoViajes = false;
				this.errorViajes = true;
			},
		});
	}

	// =========================================================
	// STEPS
	// =========================================================

	nextStep(): void {
		this.submitted = true;
		if (!this.validateStep(this.currentStep)) return;
		this.submitted = false;
		this.openDropdown = null;
		this.openCalendarAcompanante = -1;
		if (this.currentStep < 3) this.currentStep++;
	}

	prevStep(): void {
		this.submitted = false;
		this.openDropdown = null;
		this.openCalendarAcompanante = -1;
		if (this.currentStep > 1) this.currentStep--;
	}

	private validateStep(step: number): boolean {
		if (step === 1) {
			if (!this.form.idUsuario || !this.form.personas) return false;
			if (Number(this.form.personas) > 1) {
				return this.form.acompanantes.every(
					a => !!a.nombre && !!a.fechaNacimiento && !!a.tipoDocumento && !!a.documento
				);
			}
			return true;
		}
		if (step === 2) {
			return (
				this.form.idViaje !== '' &&
				!!this.form.paqueteNombre &&
				!!this.form.fechaSalida &&
				!!this.form.fechaRegreso &&
				!!this.form.tipoHabitacion
			);
		}
		if (step === 3) {
			return this.form.total !== '' && this.form.aceptaTerminos && this.form.aceptaPolitica;
		}
		return true;
	}

	// =========================================================
	// FORM CHANGES
	// =========================================================

	onPersonasChange(value: number | ''): void {
		if (value === '' || Number(value) <= 1) {
			this.form.acompanantes = [];
			return;
		}
		const count = Number(value) - 1;
		const current = this.form.acompanantes.length;
		if (count > current) {
			for (let i = current; i < count; i++) this.form.acompanantes.push(this.emptyAcompanante());
		} else {
			this.form.acompanantes = this.form.acompanantes.slice(0, count);
		}
	}

	onPaqueteChange(idPaquete: number | ''): void {
		this.selectedPaqueteId = idPaquete;
		this.form.idViaje = '';
		this.form.paqueteNombre = '';
		this.form.destino = '';
		this.form.fechaSalida = '';
		this.form.fechaRegreso = '';
		this.form.duracion = '';
		this.form.total = '';
		this.viajesFiltrados = idPaquete
			? this.viajesDisponibles.filter(v => v.idPaquete === Number(idPaquete))
			: [];
	}

	onViajeChange(idViaje: number | ''): void {
		this.form.idViaje = idViaje;
		if (!idViaje) {
			this.form.paqueteNombre = '';
			this.form.destino = '';
			this.form.fechaSalida = '';
			this.form.fechaRegreso = '';
			this.form.duracion = '';
			this.form.total = '';
			return;
		}
		const viaje = this.viajesDisponibles.find(v => v.id === Number(idViaje));
		if (viaje) {
			this.form.paqueteNombre = viaje.paqueteNombre;
			this.form.destino = viaje.destino;
			this.form.fechaSalida = viaje.fechaSalida;
			this.form.fechaRegreso = viaje.fechaRegreso;
			this.form.total = viaje.precio * (Number(this.form.personas) || 1);
			this.calcDuracion();
		}
	}

	calcDuracion(): void {
		if (!this.form.fechaSalida || !this.form.fechaRegreso) { this.form.duracion = ''; return; }
		const diff = Math.ceil(
			(new Date(this.form.fechaRegreso).getTime() - new Date(this.form.fechaSalida).getTime()) / 86400000
		);
		this.form.duracion = diff > 0 ? `${diff} ${diff === 1 ? 'día' : 'días'}` : '';
	}

	addContactoEmergencia(): void {
		this.form.contactosEmergencia.push(this.emptyContacto());
	}

	removeContactoEmergencia(i: number): void {
		this.form.contactosEmergencia.splice(i, 1);
	}

	// =========================================================
	// CONFIRM / SAVE
	// =========================================================

	confirm(): void {
		this.submitted = true;
		if (!this.validateStep(3)) return;

		const viajeSeleccionado = this.viajesDisponibles.find(v => v.id === Number(this.form.idViaje));
		if (!viajeSeleccionado) {
			this.saveError = 'Selecciona un viaje válido antes de confirmar.';
			return;
		}

		this.pendingSolicitud = {
			idUsuario: Number(this.form.idUsuario),
			idPaquete: viajeSeleccionado.idPaquete,
			idViaje: Number(this.form.idViaje),
			personas: Number(this.form.personas) || 1,
			acompanantes: this.form.acompanantes,
			contactosEmergencia: this.form.contactosEmergencia.filter(c => c.nombre.trim() !== ''),
			paqueteNombre: this.form.paqueteNombre,
			destino: this.form.destino,
			fechaSalida: this.toLocalDateTime(this.form.fechaSalida),
			fechaRegreso: this.toLocalDateTime(this.form.fechaRegreso),
			tipoHabitacion: this.form.tipoHabitacion,
			solicitudEspecial: this.form.solicitudEspecial || undefined,
			notas: this.form.notas || undefined,
			total: Number(this.form.total) || 0,
		};

		this.showConfirmModal = true;
	}

	confirmarGuardado(): void {
		if (!this.pendingSolicitud) return;
		const solicitud = this.pendingSolicitud;
		this.showConfirmModal = false;
		this.isSaving = true;
		this.saveError = '';

		this.reservationService.crear(solicitud).subscribe({
			next: (reservation) => {
				this.isSaving = false;
				this.pendingSolicitud = null;
				this.mostrarToast('Reserva creada', `La reserva de ${this.form.paqueteNombre} fue registrada exitosamente.`, 'success');
				setTimeout(() => {
					this.reservationCreated.emit(reservation);
					this.closed.emit();
				}, 1200);
			},
			error: (err) => {
				this.isSaving = false;
				this.pendingSolicitud = null;
				const msg = err?.error?.message || err?.message || 'Ocurrió un error al crear la reserva.';
				this.saveError = msg;
				this.mostrarToast('Error al crear reserva', msg, 'error');
			},
		});
	}

	cerrarConfirmModal(): void {
		this.showConfirmModal = false;
		this.pendingSolicitud = null;
	}

	mostrarToast(title: string, msg: string, type: 'success' | 'error' = 'success'): void {
		this.toastTitle = title;
		this.toastMsg = msg;
		this.toastType = type;
		this.showToast = true;
		setTimeout(() => { this.showToast = false; }, 3500);
	}

	cancel(): void { this.closed.emit(); }

	onOverlayClick(event: MouseEvent): void {
		if ((event.target as HTMLElement).classList.contains('modal-overlay')) this.cancel();
	}

	// =========================================================
	// HELPERS
	// =========================================================

	private toLocalDateTime(fecha: string): string {
		if (!fecha) return '';
		if (fecha.includes('T')) {
			const [d, t] = fecha.split('T');
			const segs = t.split(':');
			while (segs.length < 3) segs.push('00');
			return `${d}T${segs.join(':')}`;
		}
		return `${fecha}T00:00:00`;
	}

	private resetForm(): void {
		this.form = this.emptyForm();
		this.currentStep = 1;
		this.submitted = false;
		this.isSaving = false;
		this.saveError = '';
		this.documentoBusqueda = '';
		this.nombreClienteSeleccionado = '';
		this.apellidoCliente = '';
		this.tipoDocumentoCliente = '';
		this.telefonoCliente = '';
		this.ciudadCliente = '';
		this.correoCliente = '';
		this.buscandoCliente = false;
		this.errorCliente = false;
		this.errorSelfReservation = false;
		this.selectedPaqueteId = '';
		this.viajesFiltrados = [];
		this.showConfirmModal = false;
		this.pendingSolicitud = null;
		this.showToast = false;
		this.openDropdown = null;
		this.openCalendarAcompanante = -1;
	}

	private emptyForm(): ReservationForm {
		return {
			idUsuario: '', personas: '', acompanantes: [],
			contactosEmergencia: [this.emptyContacto()],
			idViaje: '', paqueteNombre: '', destino: '',
			fechaSalida: '', fechaRegreso: '', duracion: '',
			tipoHabitacion: '', solicitudEspecial: '', notas: '',
			total: '', aceptaTerminos: false, aceptaPolitica: false,
		};
	}

	private emptyAcompanante(): Acompanante {
		return { nombre: '', fechaNacimiento: '', tipoDocumento: '', documento: '' };
	}

	private emptyContacto(): ContactoEmergenciaForm {
		return { nombre: '', parentesco: '', telefono: '', correo: '' };
	}
}