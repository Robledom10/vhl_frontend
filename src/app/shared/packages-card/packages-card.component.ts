import { Component, Input, OnInit } from '@angular/core';
import { PackageDetail } from '../package-detail-sheet/package-detail-sheet.component';
import { PackageService } from '../../core/services/package.service';
import { RespuestaPaqueteTuristico } from '../../features/panel-admin/models/package.model';
import { TravelPackage, mapToTravelPackage, mapToPackageDetail, mapToPackageDetailFallback } from '../utils/package-mapper';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
export { TravelPackage };

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

	// Paginación
	paginaActual = 0;
	totalPaginas = 0;
	totalElementos = 0;
	readonly tamano = 6;

	private apiPackages: RespuestaPaqueteTuristico[] = [];

	constructor(private packageService: PackageService) { }

	ngOnInit(): void {
		if (this.showAll) {
			this.cargarPagina(0);
		} else {
			this.cargarHome();
		}
	}

	// ─── Home: carga fija de 6 con rating ─────────────────
	private cargarHome(): void {
		this.isLoading = true;
		this.packageService.getPackages({ activo: true, tamano: 6 }).subscribe({
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

	// ─── Paquetes: paginado ───────────────────────────────
	cargarPagina(pagina: number): void {
		if (pagina === 0) {
			this.isLoading = true;
			this.displayedPackages = [];
		} else {
			this.isLoadingMore = true;
		}

		this.packageService.getPackages({ activo: true, pagina, tamano: this.tamano }).subscribe({
			next: page => {
				this.apiPackages = [...this.apiPackages, ...page.content];
				this.paginaActual = page.number;
				this.totalPaginas = page.totalPages;
				this.totalElementos = page.totalElements;
				this.cargarRatings(page.content, true);
			},
			error: () => {
				this.errorMsg = 'No se pudieron cargar los paquetes.';
				this.isLoading = false;
				this.isLoadingMore = false;
			},
		});
	}

	private cargarRatings(paquetes: RespuestaPaqueteTuristico[], append: boolean): void {
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
				if (append) {
					this.displayedPackages = [...this.displayedPackages, ...result];
				} else {
					this.displayedPackages = result;
				}
				this.isLoading = false;
				this.isLoadingMore = false;
			},
			error: () => {
				this.isLoading = false;
				this.isLoadingMore = false;
			}
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