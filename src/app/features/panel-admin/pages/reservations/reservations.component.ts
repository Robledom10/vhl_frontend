import { Component, OnInit } from '@angular/core';
import { Reservation } from './models/reservations.models';
import { ReservationService } from '../../../../core/services/reservation.service';

@Component({
	selector: 'app-reservations',
	templateUrl: './reservations.component.html',
	styleUrl: './reservations.component.css',
})
export class ReservationsComponent implements OnInit {

	constructor(private reservationService: ReservationService) { }

	// ─── Modales ──────────────────────────────────────────
	showCreateModal = false;
	showCancelModal = false;
	sheetOpen = false;

	// Modal documento
	showDocumentViewer = false;
	selectedUserId = 0;

	// ─── Toast ────────────────────────────────────────────
	showToast = false;
	toastTitle = '';
	toastMessage = '';
	toastType: 'success' | 'edit' | 'delete' | 'error' = 'success';

	// ─── Estado de carga ──────────────────────────────────
	isLoading = false;
	loadError = false;

	// ─── Selección ────────────────────────────────────────
	selectedReservation: Reservation | null = null;
	selectedReservationDetail: Reservation | null = null;

	// ─── Filtros ──────────────────────────────────────────
	openFilter: string | null = null;
	searchTerm = '';
	dateFrom = '';
	dateTo = '';

	// ─── Confirmaciones ───────────────────────────────────
	showConfirmModal = false;
	confirmModalTitle = '';
	confirmModalMessage = '';
	confirmModalConfirmText = '';
	confirmModalColor = '';
	confirmModalIconBg = '';
	confirmModalIconColor = '';
	confirmModalIcon = '';
	pendingAction: (() => void) | null = null;

	activeFilters: {
		destino: string | null;
		personas: string | null;
		estado: string | null;
	} = { destino: null, personas: null, estado: null };

	destinoOptions: string[] = [];
	personasOptions: string[] = [];

	// ─── Data ─────────────────────────────────────────────
	reservations: Reservation[] = [];
	filteredReservations: Reservation[] = [];

	// ─── Paginación ───────────────────────────────────────
	paginaActual = 0;
	totalPaginas = 0;
	totalElementos = 0;
	tamano = 5;

	// ─── Lifecycle ────────────────────────────────────────

	ngOnInit(): void {
		this.loadReservations();

		document.addEventListener('click', (e) => {
			const target = e.target as HTMLElement;
			if (!target.closest('.filter-dropdown')) {
				this.openFilter = null;
			}
			if (!target.closest('.add-btn-wrapper')) {
				this.showAddDropdown = false;
			}
		});
	}

	loadReservations(): void {
		this.isLoading = true;
		this.loadError = false;
		this.reservationService.getAllPaginado(this.paginaActual, this.tamano).subscribe({
			next: (page) => {
				this.reservations = page.content;
				this.totalPaginas = page.totalPages;
				this.totalElementos = page.totalElements;
				this.paginaActual = page.number;
				this.isLoading = false;
				this.buildFilterOptions();
				this.applyFilters();
			},
			error: () => {
				this.isLoading = false;
				this.loadError = true;
			},
		});
	}

	cambiarPagina(n: number): void {
		if (n < 0 || n >= this.totalPaginas) return;
		this.paginaActual = n;
		this.loadReservations();
	}

	get paginas(): number[] {
		const delta = 2;
		const start = Math.max(0, this.paginaActual - delta);
		const end = Math.min(this.totalPaginas - 1, this.paginaActual + delta);
		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	}

	// ─── Filtros ──────────────────────────────────────────

	buildFilterOptions(): void {
		this.destinoOptions = [...new Set(this.reservations.map(r => r.destino))];
		this.personasOptions = [...new Set(this.reservations.map(r => r.personas.toString()))].sort();
	}

	toggleFilter(name: string): void {
		this.openFilter = this.openFilter === name ? null : name;
	}

	setFilter(key: keyof typeof this.activeFilters, value: string | null): void {
		this.activeFilters[key] = value as any;
		this.openFilter = null;
		this.applyFilters();
	}

	applyFilters(): void {
		this.filteredReservations = this.reservations.filter(r => {
			const nombreCompleto = `${r.datosUsuario?.nombre ?? ''} ${r.datosUsuario?.apellido ?? ''}`.toLowerCase();
			const matchSearch =
				!this.searchTerm ||
				nombreCompleto.includes(this.searchTerm.toLowerCase()) ||
				r.destino.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
				r.paqueteNombre.toLowerCase().includes(this.searchTerm.toLowerCase());

			const matchDestino =
				!this.activeFilters.destino || r.destino === this.activeFilters.destino;

			const matchPersonas =
				!this.activeFilters.personas || r.personas.toString() === this.activeFilters.personas;

			const matchEstado =
				!this.activeFilters.estado || r.estado === this.activeFilters.estado;

			const matchDateFrom =
				!this.dateFrom || r.fechaReserva >= this.dateFrom;

			const matchDateTo =
				!this.dateTo || r.fechaReserva <= this.dateTo;

			return matchSearch && matchDestino && matchPersonas && matchEstado && matchDateFrom && matchDateTo;
		});
	}

	// ─── Abrir modal genérico de confirmación ─────────────
	private openConfirmAction(
		title: string,
		message: string,
		confirmText: string,
		color: string,
		iconBg: string,
		iconColor: string,
		icon: string,
		action: () => void
	): void {
		this.confirmModalTitle = title;
		this.confirmModalMessage = message;
		this.confirmModalConfirmText = confirmText;
		this.confirmModalColor = color;
		this.confirmModalIconBg = iconBg;
		this.confirmModalIconColor = iconColor;
		this.confirmModalIcon = icon;
		this.pendingAction = action;
		this.showConfirmModal = true;
	}

	closeConfirmModal(): void {
		this.showConfirmModal = false;
		this.pendingAction = null;
	}

	executeConfirm(): void {
		if (this.pendingAction) this.pendingAction();
		this.closeConfirmModal();
	}

	// ─── Confirmar reserva ────────────────────────────────
	confirmarReserva(reservation: Reservation): void {
		this.openConfirmAction(
			'Confirmar reserva',
			`¿Deseas confirmar la reserva de ${this.getNombre(reservation)}?`,
			'Confirmar',
			'#3fa2db',
			'rgba(63, 162, 219, 0.12)',
			'#3fa2db',
			'fa-solid fa-circle-check',
			() => this.reservationService.confirmar(reservation.id).subscribe({
				next: (updated) => {
					this.replaceReservation(updated);
					this.triggerToast('Reserva confirmada', `La reserva de ${this.getNombre(updated)} fue confirmada exitosamente.`, 'success');
				},
				error: () => this.triggerToast('Error', 'No se pudo confirmar la reserva.', 'error'),
			})
		);
	}

	// ─── Reactivar reserva ────────────────────────────────
	reactivarReserva(reservation: Reservation): void {
		this.openConfirmAction(
			'Reactivar reserva',
			`¿Deseas reactivar la reserva de ${this.getNombre(reservation)}?`,
			'Reactivar',
			'#3fa2db',
			'rgba(63, 162, 219, 0.12)',
			'#3fa2db',
			'fa-solid fa-rotate-left',
			() => this.reservationService.reactivar(reservation.id).subscribe({
				next: (updated) => {
					this.replaceReservation(updated);
					this.triggerToast('Reserva reactivada', `La reserva de ${this.getNombre(updated)} fue reactivada.`, 'success');
				},
				error: () => this.triggerToast('Error', 'No se pudo reactivar la reserva.', 'error'),
			})
		);
	}

	// ─── Modal cancelar ───────────────────────────────────
	openCancelModal(reservation: Reservation): void {
		this.selectedReservation = reservation;
		this.openConfirmAction(
			'Cancelar reserva',
			`Esta acción cancelará la reserva de ${this.getNombre(reservation)}. Podrá reactivarla más adelante.`,
			'Cancelar reserva',
			'#ff3b3b',
			'rgba(255, 59, 59, 0.12)',
			'#ff3b3b',
			'fa-solid fa-triangle-exclamation',
			() => this.confirmCancel()
		);
	}

	// Ya no necesitas showCancelModal ni closeCancelModal, pero si app-confirm-modal
	// lo usa en otro lado, puedes dejarlos; si no, elimínalos.

	confirmCancel(): void {
		if (!this.selectedReservation) return;
		const nombre = this.getNombre(this.selectedReservation);
		this.reservationService.cancelar(this.selectedReservation.id).subscribe({
			next: (updated) => {
				this.replaceReservation(updated);
				this.triggerToast('Reserva cancelada', `La reserva de ${nombre} fue cancelada.`, 'delete');
			},
			error: () => this.triggerToast('Error', 'No se pudo cancelar la reserva.', 'error'),
		});
	}

	// ─── Toast ────────────────────────────────────────────
	private triggerToast(title: string, message: string, type: 'success' | 'edit' | 'delete' | 'error'): void {
		this.toastTitle = title;
		this.toastMessage = message;
		this.toastType = type;
		this.showToast = true;
		setTimeout(() => { this.showToast = false; }, 3000);
	}

	// ─── Modal crear ──────────────────────────────────────

	showAddDropdown = false;
	createModalMode: 'existing' | 'new' = 'existing';
	showCreateUserModal = false;
	prefilledDocument: string | null = null;

	toggleAddDropdown(event: MouseEvent): void {
		event.stopPropagation();
		this.showAddDropdown = !this.showAddDropdown;
	}

	openCreateModal(mode: 'existing' | 'new'): void {
		this.showAddDropdown = false;
		if (mode === 'existing') {
			this.prefilledDocument = null;
			this.createModalMode = 'existing';
			this.showCreateModal = true;
			document.body.style.overflow = 'hidden';
		} else {
			this.showCreateUserModal = true;
			document.body.style.overflow = 'hidden';
		}
	}

	onUserCreatedForReservation(data: { firstName: string; lastName: string; documentNumber: string }): void {
		this.showCreateUserModal = false;
		this.prefilledDocument = data.documentNumber;
		this.createModalMode = 'new';
		this.showCreateModal = true;
	}

	closeCreateUserModal(): void {
		this.showCreateUserModal = false;
		document.body.style.overflow = '';
	}

	closeCreateModal(): void {
		this.showCreateModal = false;
		document.body.style.overflow = '';
	}

	onReservationCreated(newReservation: Reservation): void {
		this.closeCreateModal();
		this.reservations = [newReservation, ...this.reservations];
		this.applyFilters();
		this.paginaActual = 0;
		this.loadReservations();
	}

	// ─── Bottom sheet detalle ─────────────────────────────

	openDetail(reservation: Reservation): void {
		this.selectedReservationDetail = reservation;
		this.sheetOpen = true;
	}

	closeDetail(): void {
		this.sheetOpen = false;
	}

	// ─── Helpers ──────────────────────────────────────────

	getNombre(r: Reservation): string {
		if (!r.datosUsuario) return `Usuario #${r.idUsuario}`;
		return `${r.datosUsuario.nombre} ${r.datosUsuario.apellido}`.trim();
	}

	getInitialsFromItem(r: Reservation): string {
		if (!r.datosUsuario) return '?';
		const n = (r.datosUsuario.nombre?.[0] ?? '').toUpperCase();
		const a = (r.datosUsuario.apellido?.[0] ?? '').toUpperCase();
		return (n + a) || '?';
	}

	private replaceReservation(updated: Reservation): void {
		const idx = this.reservations.findIndex(r => r.id === updated.id);
		if (idx !== -1) this.reservations[idx] = updated;
		this.applyFilters();
	}

	// Modal documento
	openDocuments(reservation: Reservation): void {
		this.selectedUserId = reservation.idUsuario;
		this.showDocumentViewer = true;
		document.body.style.overflow = 'hidden';
	}

	closeDocuments(): void {
		this.showDocumentViewer = false;
		this.selectedUserId = 0;
		document.body.style.overflow = '';
	}
}
