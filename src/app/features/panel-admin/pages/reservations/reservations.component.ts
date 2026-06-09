import { Component, OnInit } from '@angular/core';
import { Reservation } from './models/reservations.models';

@Component({
	selector: 'app-reservations',
	templateUrl: './reservations.component.html',
	styleUrl: './reservations.component.css',
})
export class ReservationsComponent implements OnInit {

	// ─── Modales ──────────────────────────────────────────
	showCreateModal = false;
	showCancelModal = false;
	sheetOpen = false;

	// ─── Toast ────────────────────────────────────────────
	showToast = false;
	toastTitle = '';
	toastMessage = '';

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
	reservations: Reservation[] = [
		{
			id: 1,
			clienteNombre: 'Camila Perez',
			clienteImagen: 'https://picsum.photos/seed/camila/200',
			clienteEmail: 'camila@email.com',
			clienteTelefono: '300 000 0001',
			destino: 'Cartagena',
			personas: 3,
			fechaViaje: '15 - 03 - 2026',
			fechaReserva: '2026-01-10',
			estado: 'Confirmada',
			paqueteNombre: 'Tour Cartagena',
			total: 1500000,
		},
		{
			id: 2,
			clienteNombre: 'Fernando M.',
			clienteImagen: 'https://picsum.photos/seed/fernando/200',
			clienteEmail: 'fernando@email.com',
			clienteTelefono: '300 000 0002',
			destino: 'Coveñas',
			personas: 1,
			fechaViaje: '15 - 03 - 2026',
			fechaReserva: '2026-01-12',
			estado: 'Pendiente',
			paqueteNombre: 'Tour Coveñas',
			total: 480000,
		},
		{
			id: 3,
			clienteNombre: 'Stefani R.',
			clienteImagen: 'https://picsum.photos/seed/stefani/200',
			clienteEmail: 'stefani@email.com',
			clienteTelefono: '300 000 0003',
			destino: 'San Andres',
			personas: 2,
			fechaViaje: '15 - 03 - 2026',
			fechaReserva: '2026-01-13',
			estado: 'Pendiente',
			paqueteNombre: 'Tour San Andrés',
			total: 3200000,
		},
		{
			id: 4,
			clienteNombre: 'Camilo Caza',
			clienteImagen: 'https://picsum.photos/seed/camilo/200',
			clienteEmail: 'camilo@email.com',
			clienteTelefono: '300 000 0004',
			destino: 'Medellín',
			personas: 4,
			fechaViaje: '15 - 03 - 2026',
			fechaReserva: '2026-01-14',
			estado: 'Confirmada',
			paqueteNombre: 'Tour Medellín',
			total: 2200000,
		},
		{
			id: 5,
			clienteNombre: 'Paula J.',
			clienteImagen: 'https://picsum.photos/seed/paula/200',
			clienteEmail: 'paula@email.com',
			clienteTelefono: '300 000 0005',
			destino: 'Santa Marta',
			personas: 6,
			fechaViaje: '15 - 03 - 2026',
			fechaReserva: '2026-01-15',
			estado: 'Pendiente',
			paqueteNombre: 'Tour Santa Marta',
			total: 4800000,
		},
		{
			id: 6,
			clienteNombre: 'Marina C.',
			clienteImagen: 'https://picsum.photos/seed/marina/200',
			clienteEmail: 'marina@email.com',
			clienteTelefono: '300 000 0006',
			destino: 'Parque del C.',
			personas: 4,
			fechaViaje: '15 - 03 - 2026',
			fechaReserva: '2026-01-16',
			estado: 'Pendiente',
			paqueteNombre: 'Tour Parque del Café',
			total: 1800000,
		},
		{
			id: 7,
			clienteNombre: 'Juan Ceballo',
			clienteImagen: 'https://picsum.photos/seed/juan/200',
			clienteEmail: 'juan@email.com',
			clienteTelefono: '300 000 0007',
			destino: 'Pscilago',
			personas: 1,
			fechaViaje: '15 - 03 - 2026',
			fechaReserva: '2026-01-17',
			estado: 'Cancelada',
			paqueteNombre: 'Tour Piscilago',
			total: 320000,
		},
	];

	filteredReservations: Reservation[] = [];

	// ─── Lifecycle ────────────────────────────────────────

	ngOnInit(): void {
		this.buildFilterOptions();
		this.applyFilters();

		document.addEventListener('click', (e) => {
			const target = e.target as HTMLElement;
			if (!target.closest('.filter-dropdown')) {
				this.openFilter = null;
			}
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
		reservation.estado = 'Confirmada';
		this.applyFilters();
		this.triggerToast(
			'Reserva confirmada',
			`La reserva de ${reservation.clienteNombre} fue confirmada exitosamente.`
		);
	}

	reactivarReserva(reservation: Reservation): void {
		reservation.estado = 'Pendiente';
		this.applyFilters();
		this.triggerToast(
			'Reserva reactivada',
			`La reserva de ${reservation.clienteNombre} fue reactivada.`
		);
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
		this.selectedReservation.estado = 'Cancelada';
		this.applyFilters();
		this.showCancelModal = false;
		this.triggerToast(
			'Reserva cancelada',
			`La reserva de ${this.selectedReservation.clienteNombre} fue cancelada.`
		);
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

	// ─── Toast helper ─────────────────────────────────────

	private triggerToast(title: string, message: string): void {
		this.toastTitle = title;
		this.toastMessage = message;
		this.showToast = true;
		setTimeout(() => {
			this.showToast = false;
		}, 3000);
	}
}