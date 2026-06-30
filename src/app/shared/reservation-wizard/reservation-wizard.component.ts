import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { PackageDetail } from '../package-detail-sheet/package-detail-sheet.component';
import { ReservationService, SolicitudReserva } from '../../core/services/reservation.service';
import { AuthService } from '../../core/services/auth.service';
import { Viaje } from '../../features/panel-admin/models/operaciones.models';
import { Subscription } from 'rxjs';
import { DatosContrato, PdfService } from '../../services/pdf.service';

@Component({
	selector: 'app-reservation-wizard',
	templateUrl: './reservation-wizard.component.html',
	styleUrl: './reservation-wizard.component.css'
})
export class ReservationWizardComponent implements OnInit, OnDestroy {

	@Output() closed = new EventEmitter<void>();
	@Input() travelers = 1;
	@Input() package: PackageDetail | null = null;
	@Input() totalPrice!: number;
	@Input() selectedTrip: Viaje | null = null;

	currentStep = 1;
	private scrollY = 0;

	attempted: Record<number, boolean> = { 1: false, 2: false, 3: false, 4: false };

	showConfirmModal = false;
	showSuccessModal = false;
	showErrorModal = false;
	errorMessage = '';
	isSubmitting = false;

	private userSubscription!: Subscription;

	emergencyContacts = [
		{ fullName: '', relationship: '', document: '', phone: '', alternatePhone: '' }
	];

	holder = {
		firstName: '', lastName: '', documentType: '',
		documentNumber: '', phone: '', city: ''
	};

	companions: any[] = [];

	additionalNotes = '';
	acceptTerms = false;
	acceptCancellation = false;

	openDropdown: string | null = null;
	showCalendarCompanion: number | null = null;

	documentTypes = [
		{ value: 'Cedula Ciudadania', label: 'Cédula de ciudadanía', short: 'CC' },
		{ value: 'Tarjeta Identidad', label: 'Tarjeta de identidad', short: 'TI' },
		{ value: 'Cedula Extranjeria', label: 'Cédula de extranjería', short: 'CE' },
		{ value: 'Pasaporte', label: 'Pasaporte', short: 'PAS' }
	];

	specialRequests = [
		'Ninguna', 'Alimentación vegana', 'Alimentación vegetariana',
		'Sin gluten', 'Silla de ruedas', 'Cama extra', 'Cuna para bebé'
	];

	roomTypes = ['Individual', 'Doble', 'Triple', 'Familiar', 'Suite'];

	selectedSpecialRequest = '';
	selectedRoomType = '';

	// ── Patrones de validación (igual de específicos que en create-user) ──
	private readonly namePattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,60}$/;
	private readonly relationshipPattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,40}$/;
	private readonly documentPattern = /^[0-9]{6,11}$/;
	private readonly phonePattern = /^\+?[\d\s\-]{7,20}$/;
	private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	private readonly cityPattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,60}$/;

	// Fecha máxima seleccionable para nacimiento de acompañantes: hoy - 5 años
	readonly maxBirthDate: string;

	constructor(
		private authService: AuthService,
		private reservationService: ReservationService,
		private router: Router,
		private pdfService: PdfService,
	) {
		const limite = new Date();
		limite.setFullYear(limite.getFullYear() - 5);
		this.maxBirthDate = [
			limite.getFullYear(),
			String(limite.getMonth() + 1).padStart(2, '0'),
			String(limite.getDate()).padStart(2, '0'),
		].join('-');
	}

	private blockScroll(): void {
		this.scrollY = window.scrollY;
		document.documentElement.style.overflow = 'hidden';
		document.documentElement.style.position = 'fixed';
		document.documentElement.style.top = `-${this.scrollY}px`;
		document.documentElement.style.width = '100%';
		document.body.style.overflow = 'hidden';
		document.body.style.position = 'fixed';
		document.body.style.top = `-${this.scrollY}px`;
		document.body.style.width = '100%';
	}

	private restoreScroll(): void {
		document.documentElement.style.overflow = '';
		document.documentElement.style.position = '';
		document.documentElement.style.top = '';
		document.documentElement.style.width = '';
		document.body.style.overflow = '';
		document.body.style.position = '';
		document.body.style.top = '';
		document.body.style.width = '';
		window.scrollTo(0, this.scrollY);
	}

	ngOnInit(): void {
		// 1. Tus lógicas iniciales existentes...
		this.blockScroll();
		this.loadCurrentUser(); // El método que ya tienes suscribiéndose a currentUser$

		// 🚀 DETECTAR DATOS INCOMPLETOS Y FORZAR CARGA:
		const userInMemory = this.authService.getUser();

		// Si hay un usuario logueado pero le faltan campos clave (como teléfono o documento)
		if (userInMemory && (!userInMemory.phone || !userInMemory.documentNumber)) {
			this.authService.getProfile().subscribe({
				next: (completeUser) => {
					console.log('¡Perfil completo cargado con éxito en el Wizard!', completeUser);
					// No necesitas asignar nada aquí manualmente, porque el .pipe(tap()) 
					// de getProfile() ya actualiza el Subject y tu HTML se refrescará solo.
				},
				error: (err) => {
					console.error('No se pudo precargar el perfil completo desde el Wizard:', err);
				}
			});
		}

		// 2. Tu inicialización de acompañantes o demás lógica...
		this.companions = Array.from(
			{ length: Math.max(this.travelers - 1, 0) },
			(_, index) => ({
				id: index,
				name: '',
				birthDate: '',
				documentType: '',
				documentNumber: ''
			})
		);
	}

	ngOnDestroy(): void {
		this.restoreScroll();
		if (this.userSubscription) {
			this.userSubscription.unsubscribe();
		}
	}

	close(): void {
		this.closed.emit();
	}

	// =========================================
	// VALIDACIÓN POR CAMPO (PASO 1 — TITULAR)
	// =========================================

	holderFieldInvalid(field: 'firstName' | 'lastName' | 'documentType' | 'documentNumber' | 'phone' | 'city'): boolean {
		if (!this.attempted[1]) return false;
		const v = (this.holder[field] || '').trim();

		switch (field) {
			case 'firstName':
			case 'lastName':
				return !this.namePattern.test(v);
			case 'documentType':
				return !v;
			case 'documentNumber':
				return !this.documentPattern.test(v);
			case 'phone':
				return !this.phonePattern.test(v);
			case 'city':
				return !this.cityPattern.test(v);
		}
	}

	private isHolderValid(): boolean {
		const h = this.holder;
		return (
			this.namePattern.test(h.firstName.trim()) &&
			this.namePattern.test(h.lastName.trim()) &&
			!!h.documentType &&
			this.documentPattern.test(h.documentNumber.trim()) &&
			this.phonePattern.test(h.phone.trim()) &&
			this.cityPattern.test(h.city.trim())
		);
	}

	// =========================================
	// VALIDACIÓN POR CAMPO (ACOMPAÑANTES)
	// =========================================

	companionFieldInvalid(companion: any, field: 'name' | 'birthDate' | 'documentType' | 'documentNumber'): boolean {
		if (!this.attempted[1]) return false;
		const v = (companion[field] || '').toString().trim();

		switch (field) {
			case 'name':
				return !this.namePattern.test(v);
			case 'birthDate':
				return !v;
			case 'documentType':
				return !v;
			case 'documentNumber':
				return !this.documentPattern.test(v);
		}
	}

	private isCompanionValid(c: any): boolean {
		return (
			this.namePattern.test((c.name || '').trim()) &&
			!!c.birthDate &&
			!!c.documentType &&
			this.documentPattern.test((c.documentNumber || '').trim())
		);
	}

	isStep1Valid(): boolean {
		if (!this.isHolderValid()) return false;
		return this.companions.every(c => this.isCompanionValid(c));
	}

	// =========================================
	// VALIDACIÓN POR CAMPO (PASO 2 — SOLICITUDES)
	// =========================================

	requestFieldInvalid(field: 'specialRequest' | 'roomType'): boolean {
		if (!this.attempted[2]) return false;

		if (field === 'specialRequest') {
			return !this.selectedSpecialRequest || this.selectedSpecialRequest === '';
		}
		if (field === 'roomType') {
			return !this.selectedRoomType || this.selectedRoomType === '';
		}
		return false;
	}

	isStep2Valid(): boolean {
		return (
			!!this.selectedSpecialRequest &&
			this.selectedSpecialRequest !== '' &&
			!!this.selectedRoomType &&
			this.selectedRoomType !== ''
		);
	}

	// =========================================
	// VALIDACIÓN POR CAMPO (PASO 3 — EMERGENCIA)
	// =========================================

	emergencyFieldInvalid(contact: any, field: 'fullName' | 'relationship' | 'phone' | 'alternatePhone'): boolean {
		if (!this.attempted[3]) return false;
		const v = (contact[field] || '').trim();

		switch (field) {
			case 'fullName':
				return !this.namePattern.test(v);
			case 'relationship':
				return !this.relationshipPattern.test(v);
			case 'phone':
				return !this.phonePattern.test(v);
			case 'alternatePhone':
				// opcional: solo invalida si escribieron algo y no es un correo válido
				return !!v && !this.emailPattern.test(v);
		}
	}

	private isEmergencyContactValid(c: any): boolean {
		const v = (c.alternatePhone || '').trim();
		const emailOk = !v || this.emailPattern.test(v);
		return (
			this.namePattern.test((c.fullName || '').trim()) &&
			this.relationshipPattern.test((c.relationship || '').trim()) &&
			this.phonePattern.test((c.phone || '').trim()) &&
			emailOk
		);
	}

	isStep3Valid(): boolean {
		return this.emergencyContacts.length > 0 && this.emergencyContacts.every(c => this.isEmergencyContactValid(c));
	}

	// =========================================
	// PASO 4
	// =========================================

	isStep4Valid(): boolean {
		return this.acceptTerms && this.acceptCancellation;
	}

	// =========================================
	// NAVEGACIÓN ENTRE PASOS (bloquea si hay campos obligatorios sin llenar)
	// =========================================

	nextStep(): void {
		this.attempted[this.currentStep] = true;

		if (this.currentStep === 1 && !this.isStep1Valid()) return;
		if (this.currentStep === 2 && !this.isStep2Valid()) return;
		if (this.currentStep === 3 && !this.isStep3Valid()) return;

		if (this.currentStep < 4) {
			this.currentStep++;
		}
	}

	previousStep(): void {
		if (this.currentStep > 1) {
			this.currentStep--;
		}
	}

	// Contactos de emergencia

	addEmergencyContact(): void {
		this.emergencyContacts.push({ fullName: '', relationship: '', document: '', phone: '', alternatePhone: '' });
	}

	removeEmergencyContact(index: number): void {
		if (this.emergencyContacts.length > 1) {
			this.emergencyContacts.splice(index, 1);
		}
	}

	// Dropdowns

	toggleDropdown(name: string, event: Event): void {
		event.stopPropagation();
		this.openDropdown = this.openDropdown === name ? null : name;
	}

	selectHolderDocument(event: Event, value: string): void {
		event.stopPropagation();
		this.holder.documentType = value;
		this.openDropdown = null;
	}

	selectCompanionDocument(event: Event, companion: any, value: string): void {
		event.stopPropagation();
		companion.documentType = value;
		this.openDropdown = null;
	}

	selectOption(event: Event, value: string, target: 'request' | 'room'): void {
		event.stopPropagation();
		if (target === 'request') this.selectedSpecialRequest = value;
		if (target === 'room') this.selectedRoomType = value;
		this.openDropdown = null;
	}

	// ── Calendario de fecha de nacimiento de acompañantes ──

	toggleCalendarCompanion(index: number, event: Event): void {
		event.stopPropagation();
		this.showCalendarCompanion = this.showCalendarCompanion === index ? null : index;
	}

	onCompanionBirthDateSelected(index: number, date: string): void {
		this.companions[index].birthDate = date;
		this.showCalendarCompanion = null;
	}

	closeCalendarCompanion(): void {
		this.showCalendarCompanion = null;
	}

	private loadCurrentUser(): void {
		this.userSubscription = this.authService.currentUser$.subscribe({
			next: (user) => {
				if (!user) return;

				// Copiar propiedades asegurando reactividad
				this.holder = {
					firstName: user.firstName ?? '',
					lastName: user.lastName ?? '',
					documentType: user.documentType ?? '',
					documentNumber: user.documentNumber ?? '',
					phone: user.phone ?? '',
					city: user.city ?? ''
				};

				// Sincronizar el dropdown visual del tipo de documento si existe
				const rawDocType = user.documentType ?? '';
				const found = this.documentTypes.find(d => d.value === rawDocType);
				if (found) {
					this.holder.documentType = found.value;
				}
			},
			error: (err) => console.error('Error al escuchar el flujo de usuario:', err)
		});
	}

	getDocumentLabel(value: string): string {
		const found = this.documentTypes.find(d => d.value === value);
		return found?.label ?? '';
	}

	private updateUserProfile(callback: () => void): void {
		const profileData: any = {
			firstName: this.holder.firstName.trim(),
			lastName: this.holder.lastName.trim(),
			phone: this.holder.phone.trim(),
			city: this.holder.city.trim(),
			documentType: this.holder.documentType,
			documentNumber: this.holder.documentNumber.trim()
		};

		this.authService.updateProfile(profileData).subscribe({
			next: updatedUser => {
				// 🔄 Conservamos el ID y propiedades previas por si el backend no las regresa en el PUT
				const previousUser = this.authService.getUser() || {};
				const finalUser = { ...previousUser, ...updatedUser };

				localStorage.setItem('user', JSON.stringify(finalUser));
				callback();
			},
			error: err => {
				console.error('Error actualizando perfil en el wizard:', err);
				// Avanzamos al callback de igual forma para no bloquear la reserva si falla el perfil
				callback();
			}
		});
	}

	confirmReservation(): void {
		this.attempted[4] = true;
		if (!this.isStep4Valid()) return;
		this.showConfirmModal = true;
	}

	closeConfirmModal(): void {
		this.showConfirmModal = false;
	}

	executeReservation(): void {
		this.showConfirmModal = false;
		this.isSubmitting = true;

		this.updateUserProfile(() => {
			const currentUser = this.authService.getUser();

			const solicitud: SolicitudReserva = {
				idUsuario: currentUser?.id ?? 0,
				idPaquete: this.selectedTrip?.idPaquete,
				personas: this.travelers,

				acompanantes: this.companions.map(companion => {
					const docTypeConfig = this.documentTypes.find(d => d.value === companion.documentType);
					return {
						nombre: companion.name,
						fechaNacimiento: companion.birthDate,
						tipoDocumento: docTypeConfig ? docTypeConfig.short : companion.documentType,
						documento: companion.documentNumber
					};
				}),

				contactosEmergencia: this.emergencyContacts
					.filter(c => c.fullName && c.relationship && c.phone)
					.map(c => ({
						nombre: c.fullName,
						parentesco: c.relationship,
						telefono: c.phone
					})),

				idViaje: this.selectedTrip?.id,
				paqueteNombre: this.package?.title ?? '',
				destino: this.package?.destinations ?? '',
				fechaSalida: this.toLocalDateTime(this.selectedTrip?.fechaSalida ?? ''),
				fechaRegreso: this.toLocalDateTime(this.selectedTrip?.fechaRegreso ?? ''),
				tipoHabitacion: this.selectedRoomType || 'No especificado',
				solicitudEspecial: this.selectedSpecialRequest,
				notas: this.additionalNotes,
				total: this.totalPrice
			};

			this.reservationService.crear(solicitud).subscribe({
				next: () => {
					this.isSubmitting = false;
					this.showSuccessModal = true;
				},
				error: error => {
					console.error('Error creando reserva', error);
					this.isSubmitting = false;
					this.errorMessage = error?.error?.mensaje || error?.error?.message || 'No se pudo crear la reserva. Intenta de nuevo.';
					this.showErrorModal = true;
				}
			});
		});
	}

	closeSuccessModal(): void {
		this.showSuccessModal = false;
		this.close();
		this.router.navigate(['/panel-admin/profile']);
	}

	closeErrorModal(): void {
		this.showErrorModal = false;
	}

	onModalClick(event: Event): void {
		event.stopPropagation();
		const target = event.target as HTMLElement;
		if (!target.closest('.custom-select') && !target.closest('.cal-wrap')) {
			this.openDropdown = null;
			this.showCalendarCompanion = null;
		}
	}

	// ── Contrato PDF ──────────────────────────────────────────────────────

	private buildDatosContrato(): DatosContrato {
		const docLabel = this.documentTypes.find(d => d.value === this.holder.documentType)?.label ?? this.holder.documentType;
		return {
			titular: {
				nombre: `${this.holder.firstName} ${this.holder.lastName}`,
				tipoDocumento: docLabel,
				numeroDocumento: this.holder.documentNumber,
				telefono: this.holder.phone,
				ciudad: this.holder.city,
			},
			paquete: {
				nombre: this.package?.title ?? '',
				destino: this.package?.destinations ?? '',
				duracion: this.package?.duration ?? '',
				lugarSalida: this.package?.departurePlace ?? '',
			},
			viaje: {
				fechaSalida: this.selectedTrip?.fechaSalida ?? '',
				fechaRegreso: this.selectedTrip?.fechaRegreso ?? '',
			},
			acompanantes: this.companions.map(c => {
				const docType = this.documentTypes.find(d => d.value === c.documentType)?.label ?? c.documentType;
				return { nombre: c.name, tipoDocumento: docType, documento: c.documentNumber, fechaNacimiento: c.birthDate };
			}),
			habitacion: this.selectedRoomType,
			solicitudEspecial: this.selectedSpecialRequest,
			notas: this.additionalNotes,
			contactosEmergencia: this.emergencyContacts.map(c => ({
				nombre: c.fullName, parentesco: c.relationship, telefono: c.phone,
				correo: c.alternatePhone || undefined,
			})),
			total: this.totalPrice,
			personas: this.travelers,
		};
	}

	abrirContrato(action: 'preview' | 'download'): void {
		this.pdfService.generateContratoPDF(this.buildDatosContrato(), action);
	}

	/**
 * Convierte un valor de fecha al formato LocalDateTime ISO ("2026-07-01T14:30:00")
 * que espera el backend.
 */
	private toLocalDateTime(fecha: string): string {
		if (!fecha) return '';
		if (fecha.includes('T')) {
			const [datePart, timePart] = fecha.split('T');
			const timeSegments = timePart.split(':');
			while (timeSegments.length < 3) {
				timeSegments.push('00');
			}
			return `${datePart}T${timeSegments.join(':')}`;
		}
		// Solo fecha, sin hora -> media noche
		return `${fecha}T00:00:00`;
	}
}