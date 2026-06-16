import { Component, Input, OnInit } from '@angular/core';
import { PackageDetail } from '../package-detail-sheet/package-detail-sheet.component';
import { PackageService } from '../../core/services/package.service';
import { RespuestaPaqueteTuristico } from '../../features/panel-admin/models/package.model';

export interface TravelPackage {
	id: number;
	name: string;
	location: string;
	price: number;
	imageUrl: string;
	rating: number;
	nights: number;
	category: string;
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
	isLoading = true;
	errorMsg = '';

	displayedPackages: TravelPackage[] = [];
	likedPackages: Set<number> = new Set();

	private apiPackages: RespuestaPaqueteTuristico[] = [];

	constructor(private packageService: PackageService) { }

	ngOnInit(): void {
		this.packageService.getPackages({ activo: true, tamano: 100 }).subscribe({
			next: (page) => {
				this.apiPackages = page.content;
				const mapped = page.content.map((p) => this.mapToTravel(p));
				this.displayedPackages = this.showAll ? mapped : mapped.slice(0, 6);
				this.isLoading = false;
			},
			error: () => {
				this.errorMsg = 'No se pudieron cargar los paquetes.';
				this.isLoading = false;
			},
		});
	}

	private mapToTravel(p: RespuestaPaqueteTuristico): TravelPackage {
		const destinos = p.destinos?.length ? p.destinos.join(' – ') : p.destino;
		return {
			id: p.id,
			name: p.titulo,
			location: destinos,
			price: p.precio,
			imageUrl: p.fotoHorizontalUrl || p.fotoVerticalUrl || '',
			rating: 4.5,
			nights: p.duracionDias,
			category: 'aventura',
		};
	}

	openDetail(pkg: TravelPackage): void {
		const api = this.apiPackages.find((p) => p.id === pkg.id);
		this.selectedPackageDetail = api ? this.mapToDetail(api) : this.mapToDetailFallback(pkg);
		this.sheetOpen = true;
	}

	closeDetail(): void {
		this.sheetOpen = false;
	}

	private mapToDetail(p: RespuestaPaqueteTuristico): PackageDetail {
		const destinos = p.destinos?.length ? p.destinos.join(', ') : p.destino;
		const nights = p.duracionDias;
		return {
			id: p.id,
			title: p.titulo,
			subtitle: p.descripcion || `Disfruta ${nights} días increíbles en ${destinos}.`,
			spotsAvailable: p.cupo,
			price: p.precio,
			destinations: destinos,
			duration: `${nights} Día${nights !== 1 ? 's' : ''} / ${nights - 1} Noche${nights - 1 !== 1 ? 's' : ''}`,
			departurePlace: p.lugarSalida || 'Por confirmar',
			transport: p.tiposTransporte?.join(', ') || p.tipoTransporte || 'Por confirmar',
			mainImage: p.fotoVerticalUrl || '',
			galleryImages: [p.fotoVerticalUrl, p.fotoHorizontalUrl].filter((url): url is string => !!url && url.trim() !== ''),
			itinerary: (p.itinerario || []).map((it) => ({
				day: `Día ${it.numeroDia}:`,
				desc: it.titulo,
			})),
			includes: p.incluye || [],
			notIncludes: p.noIncluye || [],
			cancellation: p.politicasCancelacion || [],
			requirements: p.requisitos || [],
		};
	}

	private mapToDetailFallback(pkg: TravelPackage): PackageDetail {
		return {
			id: pkg.id,
			title: pkg.name,
			subtitle: `Disfruta ${pkg.nights} noches increíbles en ${pkg.location}.`,
			spotsAvailable: 30,
			price: pkg.price,
			destinations: pkg.location,
			duration: `${pkg.nights + 1} Días / ${pkg.nights} Noches`,
			departurePlace: 'Por confirmar',
			transport: 'Por confirmar',
			mainImage: pkg.imageUrl,
			itinerary: [],
			includes: [],
			notIncludes: [],
			cancellation: [],
			requirements: [],
		};
	}

	toggleLike(id: number, event: Event): void {
		event.stopPropagation();
		this.likedPackages.has(id)
			? this.likedPackages.delete(id)
			: this.likedPackages.add(id);
	}

	isLiked(id: number): boolean {
		return this.likedPackages.has(id);
	}

	onImgError(event: Event): void {
		const img = event.target as HTMLImageElement;
		img.src = 'https://placehold.co/400x200/0077b6/white?text=Sin+imagen';
		img.onerror = null;
	}
}
