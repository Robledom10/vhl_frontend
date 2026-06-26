import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { ProviderService } from '../../../../../../core/services/provider.service';
import { RespuestaProveedor } from './models/provider.model';

@Component({
	selector: 'app-proveedor',
	templateUrl: './proveedor.component.html',
	styleUrl: './proveedor.component.css'
})
export class ProveedorComponent implements OnInit {

	showModal = false;
	modalMode: 'create' | 'edit' | 'view' = 'create';
	selectedProvider: RespuestaProveedor | null = null;
	providers: RespuestaProveedor[] = [];
	search = '';
	dropdownOpen = false;
	selectedType = 'Todos';

	// Confirmación de desactivar/activar
	showDeleteModal = false;
	providerToToggle: RespuestaProveedor | null = null;

	// Toast
	showToast = false;
	toastTitle = '';
	toastMessage = '';
	toastType: 'success' | 'edit' | 'delete' | 'error' = 'success';

	types = [
		'Todos',
		'Hotel',
		'Transporte',
	];

	// ─── Paginación ───────────────────────────────────────
	paginaActual = 0;
	totalPaginas = 0;
	totalElementos = 0;
	readonly tamano = 5;

	constructor(
		private providerService: ProviderService,
		private elementRef: ElementRef,
	) { }

	ngOnInit(): void {
		this.loadProviders();
	}

	get paginas(): number[] {
		const delta = 2;
		const start = Math.max(0, this.paginaActual - delta);
		const end = Math.min(this.totalPaginas - 1, this.paginaActual + delta);
		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	}

	cambiarPagina(n: number): void {
		if (n < 0 || n >= this.totalPaginas) return;
		this.paginaActual = n;
		this.loadProviders();
	}

	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent): void {
		if (!this.dropdownOpen) return;
		const clickedInside = this.elementRef.nativeElement.querySelector('.filter-wrapper')?.contains(event.target);
		if (!clickedInside) {
			this.dropdownOpen = false;
		}
	}

	loadProviders(): void {
		this.providerService.getProvidersPaginado({
			tipo: this.selectedType !== 'Todos' ? this.selectedType : undefined,
			busqueda: this.search || undefined,
			pagina: this.paginaActual,
			tamano: this.tamano,
		}).subscribe({
			next: (page) => {
				this.providers = page.content;
				this.totalPaginas = page.totalPages;
				this.totalElementos = page.totalElements;
				this.paginaActual = page.number;
			},
			error: (error) => {
				console.error(error);
				this.showFeedbackToast('Ocurrió un error', 'No se pudieron cargar los proveedores.', 'error');
			}
		});
	}

	toggleDropdown(): void {
		this.dropdownOpen = !this.dropdownOpen;
	}

	selectType(type: string): void {
		this.selectedType = type;
		this.dropdownOpen = false;
		this.paginaActual = 0;
		this.loadProviders();
	}

	onSearchChange(): void {
		this.paginaActual = 0;
		this.loadProviders();
	}

	get filteredProviders() {
		return this.providers;
	}

	openCreateModal(): void {
		this.modalMode = 'create';
		this.selectedProvider = null;
		this.showModal = true;
		document.body.style.overflow = 'hidden';
	}

	openEditModal(provider: RespuestaProveedor): void {
		this.modalMode = 'edit';
		this.selectedProvider = provider;
		this.showModal = true;
		document.body.style.overflow = 'hidden';
	}

	openViewModal(provider: RespuestaProveedor): void {
		this.modalMode = 'view';
		this.selectedProvider = provider;
		this.showModal = true;
		document.body.style.overflow = 'hidden';
	}

	closeModal(): void {
		this.showModal = false;
		document.body.style.overflow = '';
	}

	typeIcon(tipo: string): string {
		const map: Record<string, string> = {
			'Hotel': 'fa-solid fa-hotel',
			'Transporte': 'fa-solid fa-bus',
			'Todos': 'fa-solid fa-list',
		};
		return map[tipo] || 'fa-solid fa-box';
	}

	handleProviderSaved(payload: { nombre: string }): void {
		this.loadProviders();
		if (this.modalMode === 'create') {
			this.showFeedbackToast('Proveedor creado', `Se creó correctamente el proveedor ${payload.nombre}.`, 'success');
		} else if (this.modalMode === 'edit') {
			this.showFeedbackToast('Proveedor actualizado', `Se actualizó correctamente el proveedor ${payload.nombre}.`, 'edit');
		}
	}

	openDeleteModal(provider: RespuestaProveedor): void {
		this.providerToToggle = provider;
		this.showDeleteModal = true;
	}

	closeDeleteModal(): void {
		this.showDeleteModal = false;
	}

	get isTogglingActive(): boolean {
		return !!this.providerToToggle?.activo;
	}

	confirmToggleProvider(): void {
		if (!this.providerToToggle) return;
		const provider = this.providerToToggle;
		const wasActive = provider.activo;

		this.providerService.deleteProvider(provider.id).subscribe({
			next: () => {
				this.showDeleteModal = false;
				this.loadProviders();
				if (wasActive) {
					this.showFeedbackToast('Proveedor desactivado', `El proveedor ${provider.nombre} fue desactivado.`, 'edit');
				} else {
					this.showFeedbackToast('Proveedor activado', `El proveedor ${provider.nombre} fue activado.`, 'success');
				}
			},
			error: (error) => {
				console.error(error);
				this.showDeleteModal = false;
				this.showFeedbackToast(
					'Ocurrió un error',
					wasActive ? `No se pudo desactivar el proveedor ${provider.nombre}.` : `No se pudo activar el proveedor ${provider.nombre}.`,
					'error',
				);
			}
		});
	}

	private showFeedbackToast(title: string, message: string, type: 'success' | 'edit' | 'delete' | 'error'): void {
		this.toastTitle = title;
		this.toastMessage = message;
		this.toastType = type;
		this.showToast = true;
		setTimeout(() => { this.showToast = false; }, 3200);
	}
}