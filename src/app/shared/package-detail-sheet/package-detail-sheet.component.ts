import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
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

	visible = false;
	animating = false;
	private scrollY = 0;
	private closeTimer: ReturnType<typeof setTimeout> | null = null;

	selectedRating = 5;
	newComment = '';
	editingCommentId: number | null = null;
	editCommentText = '';
	editRating = 5;
	savingEdit = false;

	// Modal de reserva
	wizardOpen = false;

	// Número de pasajeros
	travelers = 1;

	comments: RespuestaComentarioPaquete[] = [];

	viajesDisponibles: Viaje[] = [];

	viajeSeleccionado: Viaje | null = null;

	constructor(
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

	onTripChange(): void {

		this.viajeSeleccionado =
			this.viajesDisponibles.find(
				v => v.id === Number(this.selectedTripId)
			) ?? null;

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
}
