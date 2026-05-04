import { Component, OnInit, OnDestroy } from '@angular/core';
import { BannerSlide, BANNER_DATA } from './auth-banner.utils';

@Component({
  selector: 'app-auth-banner',
  templateUrl: './auth-banner.component.html',
  styleUrl: './auth-banner.component.css'
})
export class AuthBannerComponent implements OnInit, OnDestroy {
  public images: BannerSlide[] = BANNER_DATA;
  public currentIndex: number = 0;
  private intervalId: any;

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private startAutoPlay(): void {
    this.intervalId = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    }, 4000);
  }

  public goToSlide(index: number): void {
    this.currentIndex = index;
  }
}