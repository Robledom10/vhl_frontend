import { Component, ElementRef, AfterViewInit, OnDestroy, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';

interface StatItem {
	// Valor final al que debe llegar el contador
	target: number;
	// Texto que se muestra debajo de la cifra
	label: string;
	// Sufijo que acompaña la cifra (ej: "+")
	suffix: string;
	// Valor actual mostrado en pantalla (arranca en 0 y sube)
	current: number;
}

@Component({
	selector: 'app-stats-section',
	templateUrl: './stats-section.component.html',
	styleUrls: ['./stats-section.component.css']
})
export class StatsSectionComponent implements AfterViewInit, OnDestroy {

	// Cifras del componente. Edita "target" cuando conectes el backend
	// (por ahora son valores fijos, igual que en el diseño original).
	stats: StatItem[] = [
		{ target: 150, label: 'Destinos turísticos', suffix: '+', current: 0 },
		{ target: 500, label: 'Viajeros felices', suffix: '+', current: 0 },
		{ target: 17, label: 'Años de experiencia', suffix: '+', current: 0 }
	];

	// Referencia al contenedor de la sección para detectar cuándo entra en pantalla
	@ViewChildren('statCard') statCards!: QueryList<ElementRef>;

	private observer?: IntersectionObserver;
	private animationFrameIds: number[] = [];
	private hasAnimated = false;

	constructor(private cdRef: ChangeDetectorRef) { }

	ngAfterViewInit(): void {
		// Si el navegador no soporta IntersectionObserver, animamos directo
		if (typeof IntersectionObserver === 'undefined') {
			this.startAllAnimations();
			return;
		}

		this.observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !this.hasAnimated) {
						this.hasAnimated = true;
						this.startAllAnimations();
						this.observer?.disconnect();
					}
				});
			},
			{ threshold: 0.3 }
		);

		// Observamos el primer card como referencia de "la sección ya es visible"
		if (this.statCards && this.statCards.first) {
			this.observer.observe(this.statCards.first.nativeElement);
		}
	}

	private startAllAnimations(): void {
		this.stats.forEach((stat, index) => {
			this.animateValue(stat, index, 1800); // 1800ms de duración por cifra
		});
	}

	private animateValue(stat: StatItem, index: number, duration: number): void {
		const startTime = performance.now();
		const startValue = 0;
		const endValue = stat.target;

		const step = (currentTime: number) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);

			// Easing tipo "ease-out cubic" para que la animación
			// arranque rápido y se frene suave al llegar a la cifra final
			const eased = 1 - Math.pow(1 - progress, 3);

			stat.current = Math.floor(startValue + (endValue - startValue) * eased);
			this.cdRef.markForCheck();

			if (progress < 1) {
				const frameId = requestAnimationFrame(step);
				this.animationFrameIds.push(frameId);
			} else {
				stat.current = endValue; // asegura que termine exacto en la cifra final
				this.cdRef.markForCheck();
			}
		};

		const frameId = requestAnimationFrame(step);
		this.animationFrameIds.push(frameId);
	}

	ngOnDestroy(): void {
		this.observer?.disconnect();
		this.animationFrameIds.forEach((id) => cancelAnimationFrame(id));
	}
}