import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BannerSlide, BANNER_DATA } from './auth-banner.utils';

@Component({
  selector: 'app-auth-banner',
  templateUrl: './auth-banner.component.html',
  styleUrl: './auth-banner.component.css'
})
export class AuthBannerComponent implements OnInit, OnDestroy {
  public images: BannerSlide[] = BANNER_DATA;
  public currentIndex: number = 0;
  public isAnimating: boolean = false;

  private intervalId: any;
  private animationTimeout: any;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.animationTimeout) clearTimeout(this.animationTimeout);
  }

  private startAutoPlay(): void {
    this.intervalId = setInterval(() => {
      this.changeSlide((this.currentIndex + 1) % this.images.length);
    }, 2800);
  }

  public goToSlide(index: number): void {
    if (index === this.currentIndex) return;
    // Reinicia el autoplay cuando el usuario hace clic manual
    clearInterval(this.intervalId);
    this.changeSlide(index);
    this.startAutoPlay();
  }

  /**
   * Activa la clase de animación brevemente para re-disparar
   * el keyframe de CSS cada vez que cambia el slide.
   */
  private changeSlide(index: number): void {
    this.isAnimating = true;
    this.cdr.detectChanges();

    // Quitamos la clase en el siguiente frame → CSS vuelve a animar
    if (this.animationTimeout) clearTimeout(this.animationTimeout);
    this.animationTimeout = setTimeout(() => {
      this.currentIndex = index;
      this.isAnimating = false;
      this.cdr.detectChanges();
    }, 30);
  }
}