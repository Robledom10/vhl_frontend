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
	isLoading = true;
	errorMsg = '';

	displayedPackages: TravelPackage[] = [];
	likedPackages: Set<number> = new Set();

	private apiPackages: RespuestaPaqueteTuristico[] = [];

	constructor(private packageService: PackageService) { }

	ngOnInit(): void {
		this.packageService.getPackages({ activo: true, tamano: 100 }).subscribe({
			next: page => {

				this.apiPackages = page.content;

				const requests = page.content.map(paquete =>

					this.packageService.getComments(paquete.id).pipe(

						map(comments => {
							const travelPackage = mapToTravelPackage(paquete);
							if (comments.length > 0) {
								const promedio = comments.reduce((suma, c) => suma + c.puntaje, 0) / comments.length;
								travelPackage.rating = Number(promedio.toFixed(1));
							} else {
								travelPackage.rating = 0;
							}
							return travelPackage;
						})
					)
				);

				forkJoin(requests).subscribe(result => {
					this.displayedPackages = this.showAll ? result : result.slice(0, 6);
					this.isLoading = false;
				});
			},
			error: () => {
				this.errorMsg = 'No se pudieron cargar los paquetes.';
				this.isLoading = false;
			},
		});
	}

	openDetail(pkg: TravelPackage): void {
		const api = this.apiPackages.find((p) => p.id === pkg.id);
		this.selectedPackageDetail = api ? mapToPackageDetail(api) : mapToPackageDetailFallback(pkg);
		this.sheetOpen = true;
	}

	closeDetail(): void {
		this.sheetOpen = false;
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
