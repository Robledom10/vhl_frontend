import { Component, OnInit } from '@angular/core';
import { PackageDetail } from '../../../../shared/package-detail-sheet/package-detail-sheet.component';
import { AdminPackage } from './models/packages.model';
import { PackageService } from '../../../../core/services/package.service';
import { RespuestaPaqueteTuristico, PageResponse } from '../../models/package.model';

@Component({
	selector: 'app-packages',
	templateUrl: './packages.component.html',
	styleUrls: ['./packages.component.css'],
})
export class PackagesComponent implements OnInit {

	showCreateModal = false;
	showFilters = false;
	sheetOpen = false;
	selectedPackageDetail: PackageDetail | null = null;
	showDeleteModal = false;
	showToast = false;
	toastTitle = '';
	toastMessage = '';
	toastType: 'success' | 'edit' | 'delete' | 'error' = 'success';
	selectedPackage: AdminPackage | null = null;
	editingPackage: RespuestaPaqueteTuristico | null = null;
	packages: AdminPackage[] = [];
	busqueda = '';
	destinoFiltro = '';
	duracionFiltro: number | null = null;
	estadoFiltro = 'Todos';
	cargando = false;
	private filterChangeTimer: ReturnType<typeof setTimeout> | null = null;

	// ─── Paginación ───────────────────────────────────────
	paginaActual = 0;
	totalPaginas = 0;
	totalElementos = 0;
	tamano = 5;

	get paginas(): number[] {
		const delta = 2;
		const start = Math.max(0, this.paginaActual - delta);
		const end = Math.min(this.totalPaginas - 1, this.paginaActual + delta);
		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	}

	cambiarPagina(n: number): void {
		if (n < 0 || n >= this.totalPaginas) return;
		this.paginaActual = n;
		this.cargarPaquetes();
	}

	constructor(private packageService: PackageService) { }

	ngOnInit(): void {
		this.cargarPaquetes();
	}

	openEditModal(pkg: AdminPackage): void {
		this.editingPackage = pkg.source;
		this.showCreateModal = true;
		document.body.style.overflow = 'hidden';
	}

	openCreateModal(): void {
		this.editingPackage = null;
		this.showCreateModal = true;
		document.body.style.overflow = 'hidden';
	}

	closeCreateModal(): void {
		this.editingPackage = null;
		this.showCreateModal = false;
		document.body.style.overflow = '';
	}

	handlePackageSaved(): void {
		this.cargarPaquetes();
	}

	private showFeedbackToast(title: string, message: string, type: 'success' | 'edit' | 'delete' | 'error'): void {
		this.toastTitle = title;
		this.toastMessage = message;
		this.toastType = type;
		this.showToast = true;

		setTimeout(() => { this.showToast = false; }, 3200);
	}

	private showErrorToast(message: string): void {
		this.showFeedbackToast('Ocurrió un error', message, 'error');
	}

	cargarPaquetes(): void {
		this.cargando = true;
		this.packageService.getPackages({
			busqueda: this.busqueda || undefined,
			destino: this.destinoFiltro || undefined,
			duracionDias: this.duracionFiltro || undefined,
			activo: this.estadoFiltro === 'Activos' ? true : this.estadoFiltro === 'Inactivos' ? false : undefined,
			pagina: this.paginaActual,
			tamano: this.tamano,
		}).subscribe({
			next: (page: PageResponse<RespuestaPaqueteTuristico>) => {
				this.packages = page.content.map((p: RespuestaPaqueteTuristico) => this.mapToAdminPackage(p));
				this.totalPaginas = page.totalPages;
				this.totalElementos = page.totalElements;
				this.paginaActual = page.number;
				this.cargando = false;
			},
			error: (err: any) => {
				console.error('Error cargando paquetes:', err);
				this.cargando = false;
				this.showErrorToast('No se pudieron cargar los paquetes. Intenta de nuevo.');
			}
		});
	}

	buscar(): void {
		this.paginaActual = 0;
		this.cargarPaquetes();
	}

	autoApplyFilters(delay = 300): void {
		if (this.filterChangeTimer) {
			clearTimeout(this.filterChangeTimer);
		}

		this.filterChangeTimer = setTimeout(() => {
			this.paginaActual = 0;
			this.cargarPaquetes();
		}, delay);
	}

	toggleFilters(): void {
		this.showFilters = !this.showFilters;
	}

	selectEstado(estado: string): void {
		this.estadoFiltro = estado;
		this.showFilters = false;
		this.paginaActual = 0;
		this.cargarPaquetes();
	}

	clearFilters(): void {
		if (this.filterChangeTimer) {
			clearTimeout(this.filterChangeTimer);
			this.filterChangeTimer = null;
		}

		this.busqueda = '';
		this.destinoFiltro = '';
		this.duracionFiltro = null;
		this.estadoFiltro = 'Todos';
		this.paginaActual = 0;
		this.cargarPaquetes();
	}

	private mapToAdminPackage(p: RespuestaPaqueteTuristico): AdminPackage {
		return {
			id: p.id,
			name: p.titulo,
			location: p.destino,
			duration: `${p.duracionDias} días`,
			price: p.precio,
			capacity: p.cupo,
			status: p.activo ? 'activo' : 'inactivo',
			imageUrl: p.fotoVerticalUrl || p.fotoHorizontalUrl || 'https://picsum.photos/200',
			source: p,
		};
	}

	openDetail(pkg: AdminPackage): void {
		this.selectedPackageDetail = this.mapToPackageDetail(pkg.source);
		this.sheetOpen = true;
	}

	private mapToPackageDetail(p: RespuestaPaqueteTuristico): PackageDetail {
		return {
			id: p.id,
			title: p.titulo,
			subtitle: p.descripcion || '',
			spotsAvailable: p.cupo,
			price: p.precio,
			destinations: p.destino,
			duration: `${p.duracionDias} días`,
			departurePlace: p.lugarSalida,
			transport: p.tipoTransporte,
			mainImage: p.fotoVerticalUrl || p.fotoHorizontalUrl,
			galleryImages: p.fotoHorizontalUrl ? [p.fotoHorizontalUrl] : [],
			itinerary: (p.itinerario || []).map((i: any) => ({ day: `Día ${i.numeroDia}`, desc: i.titulo })),
			includes: p.incluye || [],
			notIncludes: p.noIncluye || [],
			cancellation: p.politicasCancelacion || [],
			requirements: p.requisitos || [],
		};
	}

	closeDetail(): void {
		this.sheetOpen = false;
	}

	openDeleteModal(pkg: AdminPackage): void {
		this.selectedPackage = pkg;
		this.showDeleteModal = true;
	}

	closeDeleteModal(): void {
		this.showDeleteModal = false;
	}

	get isSelectedInactive(): boolean {
		return this.selectedPackage?.status === 'inactivo';
	}

	confirmDelete(): void {
		if (!this.selectedPackage) return;
		const deletedName = this.selectedPackage.name;
		const isInactive = this.selectedPackage.status === 'inactivo';
		const delete$ = isInactive
			? this.packageService.deletePackagePermanent(this.selectedPackage.id)
			: this.packageService.deletePackage(this.selectedPackage.id);

		delete$.subscribe({
			next: () => {
				this.showDeleteModal = false;
				if (isInactive) {
					this.showFeedbackToast(
						'Paquete eliminado',
						`Se eliminó permanentemente el paquete ${deletedName}.`,
						'delete',
					);
				} else {
					this.showFeedbackToast(
						'Paquete desactivado',
						`El paquete ${deletedName} fue desactivado correctamente.`,
						'edit',
					);
				}
				this.packages = this.packages.filter(pkg => pkg.id !== this.selectedPackage?.id);
				this.cargarPaquetes();
			},
			error: (err: any) => {
				console.error('Error eliminando paquete:', err);
				this.showDeleteModal = false;
				this.showErrorToast(
					isInactive
						? `No se pudo eliminar el paquete ${deletedName}.`
						: `No se pudo desactivar el paquete ${deletedName}.`
				);
			}
		});
	}
}