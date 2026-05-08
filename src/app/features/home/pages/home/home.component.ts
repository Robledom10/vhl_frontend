import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, AfterViewInit {
  currentIndex: number = 0;
  cardWidth: number = 260;
  gap: number = 30;
  scrollAmount: number = this.cardWidth + this.gap;

  // Cards originales
  originalCards = [
    {
      image:
        'https://res.cloudinary.com/dqcviyp18/image/upload/f_auto,q_auto:best,dpr_auto,c_fill,w_900/v1778266789/Guia_mhvb7j.png',
      title: 'GUÍAS ESPECIALIZADOS',
    },
    {
      image:
        'https://res.cloudinary.com/dqcviyp18/image/upload/f_auto,q_auto:best,dpr_auto,c_fill,w_900/v1778266789/Guia_mhvb7j.png',
      title: 'TRANSPORTE SEGURO',
    },
    {
      image:
        'https://res.cloudinary.com/dqcviyp18/image/upload/f_auto,q_auto:best,dpr_auto,c_fill,w_900/v1778266789/Guia_mhvb7j.png',
      title: 'EXPERIENCIAS ÚNICAS',
    },
    {
      image:
        'https://res.cloudinary.com/dqcviyp18/image/upload/f_auto,q_auto:best,dpr_auto,c_fill,w_900/v1778266789/Guia_mhvb7j.png',
      title: 'ALIMENTACIÓN INCLUIDA',
    },
    {
      image:
        'https://res.cloudinary.com/dqcviyp18/image/upload/f_auto,q_auto:best,dpr_auto,c_fill,w_900/v1778266789/Guia_mhvb7j.png',
      title: 'HOSPEDAJE CONFORTABLE',
    },
  ];

  // Cards duplicadas para scroll infinito
  cards: any[] = [];

  translateX: number = 0;
  startX: number = 0;
  isDragging: boolean = false;
  isTransitioning: boolean = false;

  constructor() {}

  ngOnInit(): void {
    // Duplicar las cards: [original] + [copia] + [copia]
    this.cards = [
      ...this.originalCards,
      ...this.originalCards,
      ...this.originalCards,
    ];

    // Empezar en el medio (en el primer set de cards originales)
    this.currentIndex = this.originalCards.length;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateSlider(false);
    }, 100);
  }

  updateSlider(animate: boolean = true): void {
    this.translateX = -(this.currentIndex * this.scrollAmount);
    this.isTransitioning = animate;
  }

  prevSlide(): void {
    this.currentIndex--;
    this.updateSlider(true);
    this.checkInfiniteLoop();
  }

  nextSlide(): void {
    this.currentIndex++;
    this.updateSlider(true);
    this.checkInfiniteLoop();
  }

  checkInfiniteLoop(): void {
    setTimeout(() => {
      // Si llegamos al final (último set), saltar al primer set sin animación
      if (this.currentIndex >= this.originalCards.length * 2) {
        this.currentIndex = this.originalCards.length;
        this.updateSlider(false);
      }

      // Si llegamos al inicio (antes del primer set), saltar al segundo set sin animación
      if (this.currentIndex < this.originalCards.length) {
        this.currentIndex =
          this.originalCards.length * 2 -
          (this.originalCards.length - this.currentIndex);
        this.updateSlider(false);
      }
    }, 500); // Esperar a que termine la transición
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

  // Recalcular en resize
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.updateSlider(false);
  }
}
