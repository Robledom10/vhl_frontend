import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
import { minimumAgeValidator } from '../../../../core/validators/custom.validators';
import colombiaData from '../../../../../assets/data/colombia.json';
import { ReservationService } from '../../../../core/services/reservation.service';
import { Reservation } from '../reservations/models/reservations.models';
import { PaymentService } from '../../../../core/services/payments.service';
import { DocumentManagementService } from '../../../../core/services/document-management.service';

export interface Documento {
	id?: number;
	status: 'aprobado' | 'rechazado' | 'en_proceso' | 'pendiente';
	type?: string;
}

interface UserDocumentSummary {
	idDocument: number;
	documentType: string;
	status: 'pendiente' | 'en_proceso' | 'aprobado' | 'rechazado';
	fileUrl?: string;
	createdAt?: string;
}

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit, OnDestroy {
	originalProfileData: any;

	// Calendario

	birthCalendarOpen = false;
	selectedBirthDate = '';

	// Funcionamiento del form

	isEditing = false;
	submitted = false;

	// Modal de confirmación (decisiones reales del usuario)

	showConfirmModal = false;

	// =========================
	// TOAST — notificación única para todo el perfil
	// =========================

	showToast = false;
	toastType: 'success' | 'error' = 'success';
	toastTitle = '';
	toastMessage = '';
	private toastTimeoutId: any = null;

	//  Dropdowns de departamento y ciudad

	departmentDropdownOpen = false;
	cityDropdownOpen = false;
	selectedDepartment = '';
	selectedCity = '';
	departments: string[] = [];
	cities: string[] = [];

	reservations: any[] = [];

	isLoadingReservations = false;

	sheetOpen = false;
	selectedReservation: any = null;

	showUploadModal = false;
	selectedReservationUpload: any = null;

	// =========================
	// DOCUMENTOS DEL USUARIO
	// =========================

	userDocuments: UserDocumentSummary[] = [];
	isLoadingDocuments = false;
	private documentsPollingId: any = null;
	private readonly DOCUMENTS_POLL_INTERVAL_MS = 20000;

	// =========================
	// CANCELAR RESERVA
	// =========================

	showCancelReservationModal = false;
	reservationToCancel: any = null;
	isCancellingReservation = false;

	ngOnInit(): void {
		this.loadProfile();

		if (this.isClient) {
			this.loadReservations();
			this.loadUserDocuments();
			this.startDocumentsPolling();
		}

		this.departments = colombiaData.colombia.map((item) => item.departamento);
	}

	ngOnDestroy(): void {
		this.stopDocumentsPolling();
		if (this.toastTimeoutId) {
			clearTimeout(this.toastTimeoutId);
		}
	}

	constructor(
		public authService: AuthService,
		private fb: FormBuilder,
		private reservationService: ReservationService,
		private paymentService: PaymentService,
		private documentService: DocumentManagementService
	) { }

	profileForm = this.fb.group({
		firstName: ['', [Validators.minLength(3)]],
		lastName: [''],
		phone: ['', [Validators.minLength(10), Validators.maxLength(15)]],
		birthDate: ['', [minimumAgeValidator(18)]],
		state: [''],
		city: [''],
		address: [''],
	});

	get f() {
		return this.profileForm.controls;
	}

	hiddenRoles = ['CLIENT'];

	get user() {
		return this.authService.getUser();
	}

	get isClient(): boolean {
		return this.user?.role === 'CLIENT';
	}

	get displayRole(): string | null {
		const role = this.user?.role;

		if (!role || this.hiddenRoles.includes(role)) {
			return null;
		}

		const roleMap: { [key: string]: string } = {
			ADMIN: 'Administrador',
			GUIDE: 'Guía Turístico',
		};

		return roleMap[role] || role;
	}

	// =========================
	// TOAST — helper único
	// =========================

	private notify(type: 'success' | 'error', title: string, message: string, duration = 3000): void {
		if (this.toastTimeoutId) {
			clearTimeout(this.toastTimeoutId);
			this.toastTimeoutId = null;
		}

		this.toastType = type;
		this.toastTitle = title;
		this.toastMessage = message;
		this.showToast = true;

		this.toastTimeoutId = setTimeout(() => {
			this.showToast = false;
			this.toastTimeoutId = null;
		}, duration);
	}

	// =========================
	// PERFIL
	// =========================

	loadProfile() {
		this.authService.getProfile().subscribe({
			next: (user: any) => {
				localStorage.setItem('user', JSON.stringify(user));

				this.profileForm.patchValue({
					firstName: user.firstName || '',
					lastName: user.lastName || '',
					phone: user.phone || '',
					birthDate: user.birthDate || '',
					state: user.state || '',
					city: user.city || '',
					address: user.address || '',
				});

				this.originalProfileData = this.profileForm.getRawValue();
				this.selectedBirthDate = user.birthDate || '';
				this.selectedDepartment = user.state || '';

				// Cargar ciudades del departamento
				const foundDepartment = colombiaData.colombia.find(
					(item) => item.departamento === this.selectedDepartment,
				);

				this.cities = foundDepartment?.municipios || [];

				// Ciudad
				this.selectedCity = user.city || '';
			},

			error: (err) => {
				console.error(err);
				this.notify('error', 'Error', 'No se pudo cargar la información del perfil.');
			},
		});
	}

	enableEdit() {
		this.isEditing = true;
	}

	cancelEdit() {
		this.isEditing = false;
		this.loadProfile();
		this.submitted = false;
	}

	hasChanges(): boolean {
		return (
			JSON.stringify(this.originalProfileData) !==
			JSON.stringify(this.profileForm.getRawValue())
		);
	}

	// =========================
	// GUARDAR PERFIL
	// =========================

	saveProfile() {
		this.submitted = true;

		if (this.profileForm.invalid) {
			this.profileForm.markAllAsTouched();
			return;
		}

		// 🔥 VALIDAR SI HUBO CAMBIOS
		if (!this.hasChanges()) {
			this.notify('error', 'Sin cambios', 'No realizaste ningún cambio.');
			return;
		}

		this.showConfirmModal = true;
		document.body.style.overflow = 'hidden';
	}

	confirmSaveProfile() {
		this.authService.updateProfile(this.profileForm.getRawValue()).subscribe({
			next: (updatedUser: any) => {
				localStorage.setItem('user', JSON.stringify(updatedUser));
				this.selectedBirthDate = updatedUser.birthDate || '';
				this.originalProfileData = this.profileForm.getRawValue();
				this.isEditing = false;
				this.showConfirmModal = false;
				document.body.style.overflow = '';

				this.notify('success', 'Perfil actualizado', 'La información fue actualizada correctamente.');
			},

			error: (err) => {
				console.error(err);
				this.showConfirmModal = false;
				document.body.style.overflow = '';

				const msg = err?.error?.message || err?.message || 'No se pudo actualizar el perfil.';
				this.notify('error', 'Error', msg);
			},
		});
	}

	closeConfirmModal() {
		this.showConfirmModal = false;
		document.body.style.overflow = '';
	}

	// =========================
	// CALENDARIO
	// =========================

	onDateSelected(date: string) {
		this.selectedBirthDate = date;

		this.profileForm.patchValue({
			birthDate: date,
		});

		this.f.birthDate.markAsTouched();

		this.birthCalendarOpen = false;
	}

	toggleBirthCalendar(event: Event) {
		event.stopPropagation();

		this.birthCalendarOpen = !this.birthCalendarOpen;
	}

	//   Para cambiar de departamento y cargar las ciudades correspondientes
	onDepartmentChange(department: string): void {
		const foundDepartment = colombiaData.colombia.find(
			(item) => item.departamento === department,
		);

		this.cities = foundDepartment?.municipios || [];
	}

	toggleDepartmentDropdown(event: Event) {
		event.stopPropagation();
		this.departmentDropdownOpen = !this.departmentDropdownOpen;
		this.cityDropdownOpen = false;
	}

	selectDepartment(department: string) {
		this.selectedDepartment = department;

		this.profileForm.patchValue({
			state: department,
			city: '',
		});

		this.selectedCity = '';
		this.onDepartmentChange(department);
		this.f.state.markAsTouched();
		this.departmentDropdownOpen = false;
	}

	toggleCityDropdown(event: Event) {
		event.stopPropagation();
		if (!this.selectedDepartment) return;
		this.cityDropdownOpen = !this.cityDropdownOpen;
		this.departmentDropdownOpen = false;
	}

	selectCity(city: string) {
		this.selectedCity = city;

		this.profileForm.patchValue({
			city,
		});

		this.f.city.markAsTouched();
		this.cityDropdownOpen = false;
	}

	// Reservas

	openDetail(reservation: any): void {
		this.selectedReservation = reservation;
		this.sheetOpen = true;
	}

	closeDetail(): void {
		this.sheetOpen = false;
	}

	loadReservations(): void {

		this.isLoadingReservations = true;
		const user = this.authService.getUser();
		this.reservationService.getAll().subscribe({

			next: (reservations) => {

				this.reservations = reservations.filter(
					r => r.datosUsuario?.email === user?.email
				);
				this.isLoadingReservations = false;
			},

			error: (err) => {
				console.error(err);
				this.isLoadingReservations = false;
				this.notify('error', 'Error', 'No se pudieron cargar tus reservas.');
			}
		});
	}

	openUploadModal(reservation: any): void {
		this.selectedReservationUpload = reservation;
		this.showUploadModal = true;
		document.body.style.overflow = 'hidden';
	}

	closeUploadModal(): void {
		this.showUploadModal = false;
		this.selectedReservationUpload = null;
		document.body.style.overflow = '';
		// El usuario acaba de subir algo: refresca el estado de documentos
		this.loadUserDocuments();
	}

	onDocumentUploaded(): void {
		this.notify('success', 'Documento enviado', 'Tu documento fue enviado correctamente y quedará pendiente de revisión.');
		this.closeUploadModal();
	}

	getDocumentStatus(reservation: Reservation): string {
		const docs = reservation.documentos ?? [];

		if (!docs.length) return 'Sin documentos';

		if (docs.every((d: Documento) => d.status === 'aprobado')) return 'Aprobado';

		if (docs.some((d: Documento) => d.status === 'rechazado')) return 'Rechazado';

		if (docs.some((d: Documento) => d.status === 'en_proceso')) return 'En revisión';

		return 'Enviado';
	}

	payReservation(reservation: any): void {

		if (!this.canPay(reservation)) {
			this.notify('error', 'No disponible', 'Esta reserva fue cancelada, no es posible procesar el pago.');
			return;
		}

		const user = this.authService.getUser();

		if (!reservation.packageId) {
			console.error('[Pago] Sin packageId en la reserva. Campos disponibles:', Object.keys(reservation));
			this.notify('error', 'Error', 'No se puede procesar el pago: falta el ID del paquete.');
			return;
		}

		const payload = {
			accountId: user?.id,
			packageId: reservation.packageId,
			paymentMethod: 'TARJETA',
			installments: 1
		};

		this.paymentService.createPaymentLink(payload).subscribe({

			next: (paymentUrl: string) => {

				window.location.href = paymentUrl;

			},

			error: (error) => {

				console.error('[Pago] Error al generar el link de pago:', error);
				const msg = error?.error?.message || 'No se pudo generar el link de pago.';
				this.notify('error', 'Error', msg);

			}

		});
	}

	// =========================
	// DOCUMENTOS DEL USUARIO
	// =========================

	loadUserDocuments(): void {
		const user = this.authService.getUser();
		if (!user?.id) return;

		this.isLoadingDocuments = true;

		this.documentService.getUserDocuments(user.id).subscribe({
			next: (docs) => {
				this.userDocuments = docs || [];
				this.isLoadingDocuments = false;
			},
			error: (err) => {
				console.error(err);
				this.isLoadingDocuments = false;
			}
		});
	}

	private startDocumentsPolling(): void {
		this.stopDocumentsPolling();
		this.documentsPollingId = setInterval(() => {
			this.loadUserDocuments();
		}, this.DOCUMENTS_POLL_INTERVAL_MS);
	}

	private stopDocumentsPolling(): void {
		if (this.documentsPollingId) {
			clearInterval(this.documentsPollingId);
			this.documentsPollingId = null;
		}
	}

	get totalUserDocuments(): number {
		return this.userDocuments.length;
	}

	get approvedUserDocuments(): number {
		return this.userDocuments.filter(d => d.status === 'aprobado').length;
	}

	get allDocumentsApproved(): boolean {
		return this.totalUserDocuments > 0 && this.approvedUserDocuments === this.totalUserDocuments;
	}

	get hasRejectedDocuments(): boolean {
		return this.userDocuments.some(d => d.status === 'rechazado');
	}

	getDocumentStatusLabel(): string {
		if (this.isLoadingDocuments && this.totalUserDocuments === 0) return 'Consultando documentos...';
		if (this.totalUserDocuments === 0) return 'Sin documentos';

		const conteo = `${this.approvedUserDocuments}/${this.totalUserDocuments} aprobados`;

		if (this.hasRejectedDocuments) return `Rechazado (${conteo})`;
		if (this.allDocumentsApproved) return `Aprobado (${conteo})`;
		if (this.userDocuments.some(d => d.status === 'en_proceso')) return `En revisión (${conteo})`;

		return `Enviado (${conteo})`;
	}

	getDocumentStatusClass(): string {
		if (this.totalUserDocuments === 0) return 'sin-documentos';
		if (this.hasRejectedDocuments) return 'rechazado';
		if (this.allDocumentsApproved) return 'aprobado';
		if (this.userDocuments.some(d => d.status === 'en_proceso')) return 'en-proceso';
		return 'enviado';
	}

	// =========================
	// CANCELAR RESERVA / PERMISOS
	// =========================

	canPay(reservation: any): boolean {
		if (!reservation) return false;
		return reservation.estado !== 'Cancelada';
	}

	canCancel(reservation: any): boolean {
		return reservation?.estado !== 'Cancelada';
	}

	/**
	 * Determina si el botón "Subir documento" debe mostrarse para esta reserva.
	 * Se oculta si: la reserva está cancelada, ya fue pagada/confirmada,
	 * todos los documentos ya están aprobados, o hay algún documento rechazado.
	 */
	canUploadDocuments(reservation: any): boolean {
		if (!reservation) return false;

		if (reservation.estado === 'Cancelada') return false;

		// La reserva ya fue pagada/confirmada -> no tiene sentido seguir subiendo
		if (reservation.estado === 'Confirmada' || reservation.estado === 'Completada') return false;

		if (this.allDocumentsApproved) return false;

		if (this.hasRejectedDocuments) return false;

		return true;
	}

	openCancelReservation(reservation: any): void {
		this.reservationToCancel = reservation;
		this.showCancelReservationModal = true;
		document.body.style.overflow = 'hidden';
	}

	closeCancelReservationModal(): void {
		if (this.isCancellingReservation) return;
		this.showCancelReservationModal = false;
		this.reservationToCancel = null;
		document.body.style.overflow = '';
	}

	confirmCancelReservation(): void {
		if (!this.reservationToCancel?.id) return;

		this.isCancellingReservation = true;

		this.reservationService.cancelar(this.reservationToCancel.id).subscribe({
			next: () => {
				const idx = this.reservations.findIndex(r => r.id === this.reservationToCancel.id);
				if (idx > -1) {
					// Forzamos el estado a 'Cancelada' en el frontend,
					// sin depender de lo que devuelva el backend en el DTO
					// (puede venir sin 'estado'/'estadoDescripcion' y caer al fallback 'Pendiente').
					this.reservations[idx] = {
						...this.reservations[idx],
						estado: 'Cancelada'
					};
				}

				this.isCancellingReservation = false;
				this.showCancelReservationModal = false;
				this.reservationToCancel = null;
				document.body.style.overflow = '';

				this.notify('success', 'Reserva cancelada', 'Tu reserva fue cancelada correctamente.');
			},
			error: (err) => {
				console.error(err);
				this.isCancellingReservation = false;
				this.showCancelReservationModal = false;
				this.reservationToCancel = null;
				document.body.style.overflow = '';

				const msg = err?.error?.mensaje || err?.error?.message || 'No se pudo cancelar la reserva.';
				this.notify('error', 'Error', msg);
			}
		});
	}

	// =========================
	// CLOSE DROPDOWNS
	// =========================

	@HostListener('document:click')
	closeDropdowns(): void {
		this.birthCalendarOpen = false;
		this.departmentDropdownOpen = false;
		this.cityDropdownOpen = false;
	}
}