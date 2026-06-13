import { Component, OnInit } from '@angular/core';
import { Reservation } from './models/reservations.models';
import { ReservationService } from '../../../../core/services/reservation.service';

@Component({
	selector: 'app-reservations',
	templateUrl: './reservations.component.html',
	styleUrl: './reservations.component.css',
})
export class ReservationsComponent implements OnInit {

	constructor(private reservationService: ReservationService) {}

	// ─── Modales ──────────────────────────────────────────
	showCreateModal = false;
	showCancelModal = false;
	sheetOpen = false;

	// ─── Toast ────────────────────────────────────────────
	showToast = false;
	toastTitle = '';
	toastMessage = '';

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

	// ─── Lifecycle ────────────────────────────────────────

	ngOnInit(): void {
		this.loadReservations();

		document.addEventListener('click', (e) => {
			const target = e.target as HTMLElement;
			if (!target.closest('.filter-dropdown')) {
				this.openFilter = null;
			}
		});
	}

	loadReservations(): void {
		this.isLoading = true;
		this.loadError = false;
		this.reservationService.getAll().subscribe({
			next: (data) => {
				this.reservations = data;
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
			const matchSearch =
				!this.searchTerm ||
				r.clienteNombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
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

	// ─── Acciones de fila ─────────────────────────────────

	confirmarReserva(reservation: Reservation): void {
		this.reservationService.confirmar(reservation.id).subscribe({
			next: (updated) => {
				this.replaceReservation(updated);
				this.triggerToast(
					'Reserva confirmada',
					`La reserva de ${updated.clienteNombre} fue confirmada exitosamente.`
				);
			},
			error: () => this.triggerToast('Error', 'No se pudo confirmar la reserva.'),
		});
	}

	reactivarReserva(reservation: Reservation): void {
		this.reservationService.reactivar(reservation.id).subscribe({
			next: (updated) => {
				this.replaceReservation(updated);
				this.triggerToast(
					'Reserva reactivada',
					`La reserva de ${updated.clienteNombre} fue reactivada.`
				);
			},
			error: () => this.triggerToast('Error', 'No se pudo reactivar la reserva.'),
		});
	}

	// ─── Modal cancelar ───────────────────────────────────

	openCancelModal(reservation: Reservation): void {
		this.selectedReservation = reservation;
		this.showCancelModal = true;
	}

	closeCancelModal(): void {
		this.showCancelModal = false;
	}

	confirmCancel(): void {
		if (!this.selectedReservation) return;
		const nombre = this.selectedReservation.clienteNombre;
		this.reservationService.cancelar(this.selectedReservation.id).subscribe({
			next: (updated) => {
				this.replaceReservation(updated);
				this.showCancelModal = false;
				this.triggerToast('Reserva cancelada', `La reserva de ${nombre} fue cancelada.`);
			},
			error: () => {
				this.showCancelModal = false;
				this.triggerToast('Error', 'No se pudo cancelar la reserva.');
			},
		});
	}

	// ─── Modal crear ──────────────────────────────────────

	openCreateModal(): void {
		this.showCreateModal = true;
		document.body.style.overflow = 'hidden';
	}

	closeCreateModal(): void {
		this.showCreateModal = false;
		document.body.style.overflow = '';
	}

	onReservationCreated(newReservation: Reservation): void {
		this.reservations.unshift(newReservation);
		this.buildFilterOptions();
		this.applyFilters();
		this.closeCreateModal();
		this.triggerToast(
			'Reserva creada',
			`La reserva de ${newReservation.clienteNombre} fue registrada exitosamente.`
		);
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

	private replaceReservation(updated: Reservation): void {
		const idx = this.reservations.findIndex(r => r.id === updated.id);
		if (idx !== -1) this.reservations[idx] = updated;
		this.applyFilters();
	}

	private triggerToast(title: string, message: string): void {
		this.toastTitle = title;
		this.toastMessage = message;
		this.showToast = true;
		setTimeout(() => { this.showToast = false; }, 3000);
	}
}
