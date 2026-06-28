import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, SimpleChanges, HostListener, ElementRef, ViewChild } from '@angular/core';
import { PackageService } from '../../core/services/package.service';
import { RespuestaComentarioPaquete } from './models/comments.model';
import { AuthService } from '../../core/services/auth.service';
import { OperacionesService } from '../../core/services/operaciones.service';
import { Viaje } from '../../features/panel-admin/models/operaciones.models';

export interface InfoRow {
	label: string;
	value: string;
	icon: string;
}

export interface PackageDetail {
	id: number;
	title: string;
	subtitle: string;
	spotsAvailable: number;
	price: number;
	destinations: string;
	duration: string;
	departurePlace: string;
	transport: string;
	mainImage: string;
	galleryImages?: string[];
	itinerary: { day: string; desc: string; }[];
	includes: string[];
	notIncludes: string[];
	cancellation: string[];
	requirements: string[];
}

@Component({
	selector: 'app-package-detail-sheet',
	templateUrl: './package-detail-sheet.component.html',
	styleUrl: './package-detail-sheet.component.css',
})
export class PackageDetailSheetComponent implements OnChanges, OnDestroy {
	@Input() isOpen = false;
	@Input() package: PackageDetail | null = null;
	@Output() closed = new EventEmitter<void>();

	@ViewChild('tripDropdown')
	tripDropdown!: ElementRef;

	tripDropdownOpen = false;

	visible = false;
	animating = false;
	private scrollY = 0;
	private closeTimer: ReturnType<typeof setTimeout> | null = null;

	readonly maxPalabras = 250;

	selectedRating = 5;
	newComment = '';
	editingCommentId: number | null = null;
	editCommentText = '';
	editRating = 5;
	savingEdit = false;
	deletingCommentId: number | null = null;

	// Modal de confirmación de borrado
	showDeleteModal = false;
	commentToDelete: RespuestaComentarioPaquete | null = null;

	// Toast de feedback
	showToast = false;
	toastTitle = '';
	toastMessage = '';
	private toastTimer: ReturnType<typeof setTimeout> | null = null;

	// Modal de reserva
	wizardOpen = false;

	// Número de pasajeros
	travelers = 1;

	comments: RespuestaComentarioPaquete[] = [];

	viajesDisponibles: Viaje[] = [];

	viajeSeleccionado: Viaje | null = null;

	constructor(
		private elementRef: ElementRef,
		private packageService: PackageService,
		private authService: AuthService,
		private operacionesService: OperacionesService
	) { }

	ngOnChanges(changes: SimpleChanges): void {
		if (!changes['isOpen']) return;
		if (this.isOpen) {
			if (this.closeTimer) {
				clearTimeout(this.closeTimer);
				this.closeTimer = null;
			}

			if (this.package?.id) {
				this.loadComments();
				this.loadTrips();
			}

			this.visible = true;
			this.travelers = 1;

			setTimeout(() => {
				this.animating = true;
			}, 10);

			this.blockScroll();
		} else {
			this.animating = false;
			this.closeTimer = setTimeout(() => { this.visible = false; this.closeTimer = null; }, 420);
			this.restoreScroll();
		}
	}

	ngOnDestroy(): void {
		this.restoreScroll();

		if (this.toastTimer) {
			clearTimeout(this.toastTimer);
		}
	}

	loadTrips(): void {

		if (!this.package?.id) {
			return;
		}

		this.operacionesService
			.getViajes()
			.subscribe({

				next: viajes => {

					this.viajesDisponibles = viajes
						.filter(v =>
							v.idPaquete === this.package!.id &&
							v.estado !== 'CANCELADO' &&
							v.estado !== 'FINALIZADO'
						);

				},

				error: error => {
					console.error(error);
				}

			});
	}

	selectedTripId: number | null = null;

	toggleTripDropdown(): void {
		this.tripDropdownOpen = !this.tripDropdownOpen;
	}

	selectTrip(viaje: Viaje | null): void {
		this.viajeSeleccionado = viaje;
		this.selectedTripId = viaje?.id ?? null;
		this.tripDropdownOpen = false;
	}

	get selectedTripLabel(): string {
		if (!this.viajeSeleccionado) {
			return 'Selecciona una fecha';
		}

		return `${this.formatDate(this.viajeSeleccionado.fechaSalida)} - ${this.formatDate(this.viajeSeleccionado.fechaRegreso)}`;
	}

	private formatDate(date: string | Date): string {
		const d = new Date(date);

		return d.toLocaleDateString('es-CO', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
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

	get infoRows(): InfoRow[] {
		if (!this.package) return [];
		return [
			{
				label: 'Destinos',
				value: this.package.destinations,
				icon: 'fa-regular fa-map',
			},
			{
				label: 'Duración',
				value: this.package.duration,
				icon: 'fa-regular fa-clock',
			},
			{
				label: 'Salida desde',
				value: this.package.departurePlace,
				icon: 'fa-solid fa-route',
			},
			{
				label: 'Transporte',
				value: this.package.transport,
				icon: 'fa-solid fa-bus-simple',
			},
		];
	}

	get galleryImages(): string[] {
		return this.package?.galleryImages ?? [];
	}

	close(): void {
		this.closed.emit();
	}

	onOverlayClick(event: MouseEvent): void {
		if ((event.target as HTMLElement).classList.contains('sheet-overlay')) {
			this.close();
		}
	}

	// Lógica para aumentar/disminuir número de pasajeros
	increaseTravelers(): void {
		if (!this.package) return;

		if (this.travelers < this.package.spotsAvailable) {
			this.travelers++;
		}
	}

	decreaseTravelers(): void {
		if (this.travelers > 1) {
			this.travelers--;
		}
	}

	get totalPrice(): number {
		if (!this.package) return 0;

		return this.travelers * this.package.price;
	}

	// Lógica para abrir el modal de reserva
	closeReservationWizard(): void {
		this.wizardOpen = false;
	}

	openReservationWizard(): void {
		this.wizardOpen = true;
		this.close();
	}

	// Comentarios y valoraciones

	loadComments(): void {

		if (!this.package?.id) {
			return;
		}

		this.packageService
			.getComments(this.package.id)
			.subscribe({
				next: comments => {
					this.comments = comments;
				},
				error: error => {
					console.error(error);
				}
			});
	}

	submitComment(): void {

		if (!this.package?.id) {
			return;
		}

		if (!this.newComment.trim()) {
			return;
		}

		if (this.newCommentWords > this.maxPalabras) {
			return;
		}

		const request = {
			comentario: this.newComment,
			puntaje: this.selectedRating
		};

		this.packageService
			.createComment(
				this.package.id,
				request
			)
			.subscribe({

				next: () => {

					this.newComment = '';
					this.selectedRating = 5;

					this.loadComments();
				},

				error: error => {
					console.error(error);
				}
			});
	}

	startEditComment(comment: RespuestaComentarioPaquete): void {
		this.editingCommentId = comment.id;
		this.editCommentText = comment.comentario;
		this.editRating = comment.puntaje;
	}

	cancelEditComment(): void {
		this.editingCommentId = null;
		this.editCommentText = '';
		this.editRating = 5;
	}

	saveEditComment(comment: RespuestaComentarioPaquete): void {
		if (!this.package?.id || !this.editCommentText.trim()) {
			return;
		}

		if (this.editCommentWords > this.maxPalabras) {
			return;
		}

		this.savingEdit = true;

		this.packageService
			.updateComment(
				this.package.id,
				comment.id,
				{
					comentario: this.editCommentText,
					puntaje: this.editRating
				}
			)
			.subscribe({
				next: updatedComment => {
					this.comments = this.comments.map(item =>
						item.id === updatedComment.id ? updatedComment : item
					);
					this.savingEdit = false;
					this.cancelEditComment();
				},
				error: error => {
					this.savingEdit = false;
					console.error(error);
				}
			});
	}

	askDeleteComment(comment: RespuestaComentarioPaquete): void {
		if (this.deletingCommentId !== null) {
			return;
		}

		this.commentToDelete = comment;
		this.showDeleteModal = true;
	}

	closeDeleteModal(): void {
		this.showDeleteModal = false;
		this.commentToDelete = null;
	}

	confirmDeleteComment(): void {
		const comment = this.commentToDelete;

		if (!this.package?.id || !comment) {
			return;
		}

		this.showDeleteModal = false;
		this.deletingCommentId = comment.id;

		this.packageService
			.deleteComment(this.package.id, comment.id)
			.subscribe({
				next: () => {
					this.comments = this.comments.filter(item => item.id !== comment.id);

					if (this.editingCommentId === comment.id) {
						this.cancelEditComment();
					}

					this.deletingCommentId = null;
					this.commentToDelete = null;
					this.showFeedbackToast('Comentario eliminado', 'Tu comentario se eliminó correctamente.');
				},
				error: error => {
					this.deletingCommentId = null;
					this.commentToDelete = null;
					console.error(error);
					this.showFeedbackToast('Ocurrió un error', 'No se pudo eliminar tu comentario, inténtalo de nuevo.');
				}
			});
	}

	private showFeedbackToast(title: string, message: string): void {
		this.toastTitle = title;
		this.toastMessage = message;
		this.showToast = true;

		if (this.toastTimer) {
			clearTimeout(this.toastTimer);
		}

		this.toastTimer = setTimeout(() => { this.showToast = false; }, 3200);
	}

	private contarPalabras(texto: string): number {
		const limpio = texto.trim();

		return limpio ? limpio.split(/\s+/).length : 0;
	}

	get newCommentWords(): number {
		return this.contarPalabras(this.newComment);
	}

	get editCommentWords(): number {
		return this.contarPalabras(this.editCommentText);
	}

	canEditComment(comment: RespuestaComentarioPaquete): boolean {
		const userName = this.currentUserName;

		return !!userName && this.normalizeUserName(comment.autor) === this.normalizeUserName(userName);
	}

	get isLogged(): boolean {
		return this.authService.isAuthenticated();
	}

	private get currentUserName(): string {
		const user = this.authService.getUser();
		const tokenUser = this.getTokenUser();
		const fullName = [user?.firstName, user?.lastName]
			.filter(Boolean)
			.join(' ')
			.trim();
		const tokenFullName = [tokenUser?.firstName, tokenUser?.lastName]
			.filter(Boolean)
			.join(' ')
			.trim();

		return fullName || user?.name || tokenFullName || tokenUser?.name || user?.email || tokenUser?.email || '';
	}

	private normalizeUserName(value: string): string {
		return value.trim().replace(/\s+/g, ' ').toLowerCase();
	}

	private getTokenUser(): { firstName?: string; lastName?: string; name?: string; email?: string } | null {
		const token = this.authService.getToken();

		if (!token) {
			return null;
		}

		try {
			const payload = token.split('.')[1];
			const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
			const decodedPayload = decodeURIComponent(
				atob(normalizedPayload)
					.split('')
					.map(char => `%${('00' + char.charCodeAt(0).toString(16)).slice(-2)}`)
					.join('')
			);

			return JSON.parse(decodedPayload);
		} catch (error) {
			console.error('Error leyendo datos del token:', error);

			return null;
		}
	}

	// HostListener

	@HostListener('document:mousedown', ['$event'])
	onDocumentClick(event: MouseEvent) {

		if (!this.tripDropdownOpen) {
			return;
		}

		if (!this.tripDropdown.nativeElement.contains(event.target)) {
			this.tripDropdownOpen = false;
		}
	}
}