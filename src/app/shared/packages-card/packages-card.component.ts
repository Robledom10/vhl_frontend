import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PackageDetail } from '../package-detail-sheet/package-detail-sheet.component';
import { PackageService } from '../../core/services/package.service';
import { RespuestaPaqueteTuristico } from '../../features/panel-admin/models/package.model';
import { TravelPackage, mapToTravelPackage, mapToPackageDetail, mapToPackageDetailFallback } from '../utils/package-mapper';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

interface FiltrosActivos {
	destino?: string;
	fecha?: string;      // YYYY-MM-DD — se usa para duracionDias si el API no acepta fecha directa
	personas?: number;
}

@Component({
	selector: 'app-packages-card',
	templateUrl: './packages-card.component.html',
	styleUrls: ['./packages-card.component.css'],
})
export class PackagesCardComponent implements OnInit {
	@Input() showAll: boolean = false;

	sheetOpen = false;
	selectedPackageDetail: PackageDetail | null = null;
	isLoading = false;
	isLoadingMore = false;
	errorMsg = '';

	displayedPackages: TravelPackage[] = [];
	likedPackages: Set<number> = new Set();

	paginaActual = 0;
	totalPaginas = 0;
	totalElementos = 0;
	readonly tamano = 6;

	private apiPackages: RespuestaPaqueteTuristico[] = [];
	private autoOpenPackageId: number | null = null;
	private filtros: FiltrosActivos = {};

	hayFiltrosActivos = false;

	constructor(
		private packageService: PackageService,
		private route: ActivatedRoute
	) { }

	ngOnInit(): void {
		this.route.queryParams.subscribe(params => {
			// Auto-abrir paquete (flujo hero)
			const openId = params['openPackage'];
			this.autoOpenPackageId = openId ? +openId : null;

			// Filtros
			this.filtros = {};
			if (params['destino']) this.filtros.destino = params['destino'];
			if (params['fecha']) this.filtros.fecha = params['fecha'];
			if (params['personas']) this.filtros.personas = +params['personas'];

			this.hayFiltrosActivos = !!(params['destino'] || params['fecha'] || params['personas']);

			// Recargar siempre que cambien los params
			this.apiPackages = [];
			this.displayedPackages = [];

			if (this.showAll) {
				this.cargarPagina(0);
			} else {
				this.cargarHome();
			}
		});
	}

	// ─── Home: muestra solo 6 ─────────────────────────────
	private cargarHome(): void {
		this.isLoading = true;
		this.packageService.getPackages({
			activo: true,
			tamano: 6,
			busqueda: this.filtros.destino,
		}).subscribe({
			next: page => {
				this.apiPackages = page.content;
				this.cargarRatings(page.content, false);
			},
			error: () => {
				this.errorMsg = 'No se pudieron cargar los paquetes.';
				this.isLoading = false;
			},
		});
	}

	// ─── Paquetes: paginado con filtros ──────────────────
	cargarPagina(pagina: number): void {
		if (pagina === 0) {
			this.isLoading = true;
			this.displayedPackages = [];
			this.apiPackages = [];
		} else {
			this.isLoadingMore = true;
		}

		this.packageService.getPackages({
			activo: true,
			pagina,
			tamano: this.tamano,
			busqueda: this.filtros.destino,
		}).subscribe({
			next: page => {
				// Filtro local por personas (spotsAvailable)
				const contenido = this.filtros.personas
					? page.content.filter(p => p.cupo >= this.filtros.personas!)
					: page.content;

				this.apiPackages = [...this.apiPackages, ...contenido];
				this.paginaActual = page.number;
				this.totalPaginas = page.totalPages;
				this.totalElementos = page.totalElements;
				this.cargarRatings(contenido, pagina > 0);
			},
			error: () => {
				this.errorMsg = 'No se pudieron cargar los paquetes.';
				this.isLoading = false;
				this.isLoadingMore = false;
			},
		});
	}

	private cargarRatings(paquetes: RespuestaPaqueteTuristico[], append: boolean): void {
		if (paquetes.length === 0) {
			if (!append) this.displayedPackages = [];
			this.isLoading = false;
			this.isLoadingMore = false;
			return;
		}

		const requests = paquetes.map(p =>
			this.packageService.getComments(p.id).pipe(
				map(comments => {
					const pkg = mapToTravelPackage(p);
					if (comments.length > 0) {
						const promedio = comments.reduce((s, c) => s + c.puntaje, 0) / comments.length;
						pkg.rating = Number(promedio.toFixed(1));
					} else {
						pkg.rating = 0;
					}
					return pkg;
				})
			)
		);

		forkJoin(requests).subscribe({
			next: result => {
				this.displayedPackages = append
					? [...this.displayedPackages, ...result]
					: result;
				this.isLoading = false;
				this.isLoadingMore = false;

				if (this.autoOpenPackageId !== null) {
					this.tryAutoOpen();
				}
			},
			error: () => {
				this.isLoading = false;
				this.isLoadingMore = false;
			}
		});
	}

	private tryAutoOpen(): void {
		const id = this.autoOpenPackageId!;
		this.autoOpenPackageId = null;

		const apiPkg = this.apiPackages.find(p => p.id === id);
		if (apiPkg) {
			this.selectedPackageDetail = mapToPackageDetail(apiPkg);
			this.sheetOpen = true;
			return;
		}

		this.packageService.getPackageById(id).subscribe({
			next: pkg => {
				this.selectedPackageDetail = mapToPackageDetail(pkg);
				this.sheetOpen = true;
			},
			error: err => console.error('No se pudo abrir el paquete automáticamente:', err)
		});
	}

	get hayMas(): boolean {
		return this.paginaActual < this.totalPaginas - 1;
	}

	cargarMas(): void {
		if (!this.hayMas || this.isLoadingMore) return;
		this.cargarPagina(this.paginaActual + 1);
	}

	openDetail(pkg: TravelPackage): void {
		const api = this.apiPackages.find(p => p.id === pkg.id);
		this.selectedPackageDetail = api ? mapToPackageDetail(api) : mapToPackageDetailFallback(pkg);
		this.sheetOpen = true;
	}

	closeDetail(): void { this.sheetOpen = false; }

	toggleLike(id: number, event: Event): void {
		event.stopPropagation();
		this.likedPackages.has(id) ? this.likedPackages.delete(id) : this.likedPackages.add(id);
	}

	isLiked(id: number): boolean { return this.likedPackages.has(id); }

	onImgError(event: Event): void {
		const img = event.target as HTMLImageElement;
		img.src = 'https://placehold.co/400x200/0077b6/white?text=Sin+imagen';
		img.onerror = null;
	}
}