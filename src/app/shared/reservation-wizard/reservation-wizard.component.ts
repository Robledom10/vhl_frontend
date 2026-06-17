import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PackageDetail } from '../package-detail-sheet/package-detail-sheet.component';
import { ReservationService, SolicitudReserva } from '../../core/services/reservation.service';
import { AuthService } from '../../core/services/auth.service';
import { Viaje } from '../../features/panel-admin/models/operaciones.models';

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

	emergencyContacts = [
		{
			fullName: '',
			relationship: '',
			document: '',
			phone: '',
			alternatePhone: ''
		}
	];

	holder = {
		firstName: '',
		lastName: '',
		documentType: '', // Guardará la abreviatura (ej: 'CC')
		documentNumber: '',
		email: '',
		phone: '',
		city: ''
	};

	selectedDepartureDate = '';

	selectedReturnDate = '';

	companions: any[] = [];

	specialRequest = '';

	roomType = '';

	additionalNotes = '';

	acceptTerms = false;

	acceptCancellation = false;

	// Dropdowns

	openDropdown: string | null = null;

	// MODIFICADO: Arreglo de objetos con abreviatura y nombre completo
	documentTypes = [
		{ value: 'CC', label: 'Cédula de ciudadanía' },
		{ value: 'TI', label: 'Tarjeta de identidad' },
		{ value: 'CE', label: 'Cédula de extranjería' },
		{ value: 'PA', label: 'Pasaporte' }
	];

	specialRequests = [
		'Ninguna',
		'Alimentación vegana',
		'Alimentación vegetariana',
		'Sin gluten',
		'Silla de ruedas',
		'Cama extra',
		'Cuna para bebé'
	];

	roomTypes = [
		'Individual',
		'Doble',
		'Triple',
		'Familiar',
		'Suite'
	];

	paymentMethods = [
		'Efectivo',
		'Transferencia bancaria',
		'Tarjeta de crédito',
		'Tarjeta de débito',
		'PSE',
		'Nequi',
		'Daviplata'
	];

	paymentStatuses = [
		'Pendiente',
		'Anticipo pagado',
		'Pago completo'
	];

	selectedSpecialRequest = '';
	selectedRoomType = '';
	selectedPaymentMethod = '';
	selectedPaymentStatus = '';

	constructor(
		private authService: AuthService,
		private reservationService: ReservationService
	) { }

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
		this.blockScroll();
		this.loadCurrentUser();

		this.companions = Array.from(
			{ length: Math.max(this.travelers - 1, 0) },
			(_, index) => ({
				id: index,
				name: '',
				birthDate: '',
				documentType: '', // Guardará la abreviatura
				documentNumber: ''
			})
		);
	}

	ngOnDestroy(): void {
		this.restoreScroll();
	}

	private loadCurrentUser(): void {
		const user = this.authService.getUser();
		if (!user) { return; }

		this.holder.firstName = user.firstName ?? '';
		this.holder.lastName = user.lastName ?? '';
		this.holder.email = user.email ?? '';
		this.holder.phone = user.phone ?? user.telefono ?? '';
		this.holder.city = user.city ?? user.ciudad ?? '';

		// Al recibirlo, intentamos mapear a abreviatura si viene el nombre largo completo
		const rawDocType = user.documentType ?? user.tipoDocumento ?? '';
		const found = this.documentTypes.find(d => d.label === rawDocType || d.value === rawDocType);
		this.holder.documentType = found ? found.value : rawDocType;

		this.holder.documentNumber = user.documentNumber ?? user.numeroDocumento ?? '';
	}

	// NUEVO MÉTODO AUXILIAR: Para mostrar el texto largo en la interfaz basado en la abreviatura guardada
	getDocumentLabel(value: string): string {
		const found = this.documentTypes.find(d => d.value === value);
		return found ? found.label : '';
	}

	close(): void {
		this.closed.emit();
	}

	nextStep(): void {
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
		this.emergencyContacts.push({
			fullName: '',
			relationship: '',
			document: '',
			phone: '',
			alternatePhone: ''
		});
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

	selectHolderDocument(
		event: Event,
		value: string
	): void {

		event.stopPropagation();
		this.holder.documentType = value; // Guarda la abreviatura (option.value)
		this.openDropdown = null;
	}

	selectCompanionDocument(
		event: Event,
		companion: any,
		value: string
	): void {

		event.stopPropagation();
		companion.documentType = value; // Guarda la abreviatura (option.value)
		this.openDropdown = null;
	}

	selectOption(
		event: Event,
		value: string,
		target:
			| 'request'
			| 'room'
			| 'payment'
			| 'status'
	): void {

		event.stopPropagation();

		switch (target) {

			case 'request': this.selectedSpecialRequest = value;
				break;

			case 'room': this.selectedRoomType = value;
				break;

			case 'payment': this.selectedPaymentMethod = value;
				break;

			case 'status': this.selectedPaymentStatus = value;
				break;
		}

		this.openDropdown = null;
	}

	// Reserva

	confirmReservation(): void {

		const currentUser = this.authService.getUser();

		const solicitud: SolicitudReserva = {
			idUsuario: currentUser?.id ?? 0,
			idPaquete: this.selectedTrip?.idPaquete,
			personas: this.travelers,
			acompanantes: this.companions.map(companion => ({
				nombre: companion.name,
				fechaNacimiento: companion.birthDate,
				tipoDocumento: companion.documentType,
				documento: companion.documentNumber
			})),
			contactosEmergencia: this.emergencyContacts
				.filter(c => c.fullName && c.relationship && c.phone)
				.map(c => ({
					nombre: c.fullName,
					parentesco: c.relationship,
					telefono: c.phone,
				})),
			idViaje: this.selectedTrip?.id,
			paqueteNombre: this.package?.title ?? '',
			destino: this.package?.destinations ?? '',
			fechaSalida: this.selectedTrip?.fechaSalida ?? '',
			fechaRegreso: this.selectedTrip?.fechaRegreso ?? '',
			tipoHabitacion: this.selectedRoomType,
			solicitudEspecial: this.selectedSpecialRequest,
			notas: this.additionalNotes,
			total: this.totalPrice
		};

		this.reservationService
			.crear(solicitud)
			.subscribe({

				next: reservation => {

					console.log(
						'Reserva creada',
						reservation
					);

					this.close();
				},

				error: error => {

					console.error(
						'Error creando reserva',
						error
					);
				}
			});
	}

	// Funcionamiento de abrir y cerrar el modal y el dropdown

	onModalClick(event: Event): void {

		event.stopPropagation();

		const target = event.target as HTMLElement;

		if (!target.closest('.custom-select')) {
			this.openDropdown = null;
		}
	}
}