import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';

@Component({
	selector: 'app-slider-work-team',
	templateUrl: './slider-work-team.component.html',
	styleUrl: './slider-work-team.component.css',
})
export class SliderWorkTeamComponent implements OnInit, AfterViewInit {
	cardWidth: number = 260;
	gap: number = 30;
	scrollAmount: number = this.cardWidth + this.gap;
	currentIndex: number = 0;

	// Cards originales con colores de fondo diferentes
	originalCards = [
		{
			image:
				'https://res.cloudinary.com/dqcviyp18/image/upload/f_auto,q_auto:best,dpr_auto,c_fill,w_900/v1778266789/Guia_mhvb7j.png',
			title: 'GUÍAS ESPECIALIZADOS',
			backgroundColor: '#b3f4fb',
			colorText: "#00bfd8",
		},
		{
			image:
				'https://res.cloudinary.com/dqcviyp18/image/upload/f_auto,q_auto:best,dpr_auto,c_fill,w_900/v1778266789/Seguridad_yq9qh0.png',
			title: 'SEGURIDAD',
			backgroundColor: '#c5d5eb',
			colorText: "#123862",
		},
		{
			image:
				'https://res.cloudinary.com/dqcviyp18/image/upload/f_auto,q_auto:best,dpr_auto,c_fill,w_900/v1778266789/Paramedicos_yks9xt.png',
			title: 'PARAMÉDICOS',
			backgroundColor: '#ffc2b3',
			colorText: "#e64503",
		},
		{
			image:
				'https://res.cloudinary.com/dqcviyp18/image/upload/f_auto,q_auto:best,dpr_auto,c_fill,w_900/v1778266790/fotografia_bykb9u.png',
			title: 'EQUIPO DE FOTOGRAFÍA',
			backgroundColor: '#c7dcf5',
			colorText: "#347ec4",
		},
		{
			image:
				'https://res.cloudinary.com/dqcviyp18/image/upload/f_auto,q_auto:best,dpr_auto,c_fill,w_900/v1778266790/dj_va93gr.png',
			title: 'DJ',
			backgroundColor: '#c7f1c2',
			colorText: "#188e05",
		},
		{
			image:
				'https://res.cloudinary.com/dqcviyp18/image/upload/f_auto,q_auto:best,dpr_auto,c_fill,w_900/v1778266789/psicologia_vsybzj.png',
			title: 'ATENCIÓN PSICOLÓGICA',
			backgroundColor: '#f3d1c0',
			colorText: "#9e4d03",
		},
	];

	// Cards extendidas para loop infinito
	cards: any[] = [];
	translateX: number = 0;
	isTransitioning: boolean = true;

	startX: number = 0;
	isDragging: boolean = false;

	constructor() { }

	ngOnInit(): void {
		// Crear 3 copias del array para scroll infinito
		this.cards = [
			...this.originalCards,
			...this.originalCards,
			...this.originalCards,
		];

		// Empezar en la segunda copia (posición central)
		this.currentIndex = this.originalCards.length;
	}

	ngAfterViewInit(): void {
		setTimeout(() => {
			this.updateSlider(false);
		}, 0);
	}

	updateSlider(animate: boolean = true): void {
		this.isTransitioning = animate;
		this.translateX = -(this.currentIndex * this.scrollAmount);
	}

	nextSlide(): void {
		this.currentIndex++;
		this.updateSlider(true);
		this.checkLoop();
	}

	prevSlide(): void {
		this.currentIndex--;
		this.updateSlider(true);
		this.checkLoop();
	}

	checkLoop(): void {
		setTimeout(() => {
			// Si llegamos al final de la tercera copia, volver a la segunda copia
			if (this.currentIndex >= this.originalCards.length * 2) {
				this.currentIndex = this.originalCards.length;
				this.updateSlider(false);
			}

			// Si llegamos al inicio de la primera copia, volver a la segunda copia
			if (this.currentIndex < this.originalCards.length) {
				this.currentIndex = this.originalCards.length * 2 - 1;
				this.updateSlider(false);
			}
		}, 500);
	}

	// Soporte táctil
	onTouchStart(event: TouchEvent): void {
		this.startX = event.touches[0].clientX;
		this.isDragging = true;
	}

	onTouchMove(event: TouchEvent): void {
		if (!this.isDragging) return;
		event.preventDefault();
	}

	onTouchEnd(event: TouchEvent): void {
		if (!this.isDragging) return;

		const endX = event.changedTouches[0].clientX;
		const diff = this.startX - endX;

		if (Math.abs(diff) > 50) {
			if (diff > 0) {
				this.nextSlide();
			} else {
				this.prevSlide();
			}
		}

		this.isDragging = false;
	}

	@HostListener('window:resize', ['$event'])
	onResize(event: any): void {
		this.updateSlider(false);
	}
}
