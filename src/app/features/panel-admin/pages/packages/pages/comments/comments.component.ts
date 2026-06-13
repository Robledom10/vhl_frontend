import { Component, ElementRef, HostListener } from '@angular/core';

@Component({
	selector: 'app-comments',
	templateUrl: './comments.component.html',
	styleUrl: './comments.component.css'
})
export class CommentsComponent {

	showPackageFilter = false;
	showRatingFilter = false;

	selectedPackage = '';
	selectedRating = '';

	constructor(
		private elementRef: ElementRef
	) { }

	comments = [
		{
			autor: 'Manuel Quintero',
			paquete: 'Excursionista 2025',
			comentario: 'Una experiencia inolvidable, llena de momentos únicos, paisajes increíbles y recuerdos que quedarán para siempre.',
			puntaje: 5,
			selected: true

		},
		{
			autor: 'Laura Gómez',
			paquete: 'Cartagena',
			comentario: 'Muy buena organización y excelente atención durante todo el recorrido.',
			puntaje: 4,
			selected: true

		},
		{
			autor: 'Juan Pérez',
			paquete: 'Santa Marta',
			comentario: 'El viaje fue espectacular, repetiría nuevamente.',
			puntaje: 5,
			selected: false

		},
		{
			autor: 'Sara López',
			paquete: 'San Andrés',
			comentario: 'Excelente experiencia y muy buenos hoteles.',
			puntaje: 4,
			selected: true

		},
		{
			autor: 'Carlos Ruiz',
			paquete: 'Cartagena',
			comentario: 'Todo salió según lo planeado y el servicio fue excelente.',
			puntaje: 5,
			selected: false

		},
		{
			autor: 'Ana Torres',
			paquete: 'Santa Marta',
			comentario: 'Paisajes hermosos y una experiencia muy agradable.',
			puntaje: 4,
			selected: false

		}
	];

	selectPackage(value: string): void {
		this.selectedPackage = value;
		this.showPackageFilter = false;
	}

	selectRating(value: string): void {
		this.selectedRating = value;
		this.showRatingFilter = false;
	}

	toggleComment(comment: any): void {
		comment.selected = !comment.selected;

		console.log(comment);
	}

	togglePackageFilter(): void {

		this.showPackageFilter = !this.showPackageFilter;

		if (this.showPackageFilter) {
			this.showRatingFilter = false;
		}
	}

	toggleRatingFilter(): void {

		this.showRatingFilter = !this.showRatingFilter;

		if (this.showRatingFilter) {
			this.showPackageFilter = false;
		}
	}

	@HostListener('document:click', ['$event'])
	onClickOutside(event: MouseEvent): void {

		const target = event.target as HTMLElement;

		const clickedFilter = target.closest('.filter-wrapper');

		if (!clickedFilter) {
			this.showPackageFilter = false;
			this.showRatingFilter = false;
		}
	}
}