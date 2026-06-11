import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { BannerSlide, BANNER_DATA } from './auth-banner.utils';

@Component({
	selector: 'app-auth-banner',
	templateUrl: './auth-banner.component.html',
	styleUrl: './auth-banner.component.css',
	animations: [
		trigger('slideChange', [
			transition('* => *', [
				style({ opacity: 0, transform: 'scale(1.06)' }),
				animate(
					'1000ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
					style({ opacity: 1, transform: 'scale(1)' }),
				),
			]),
		]),
	],
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
		}, 2800);
	}

	public goToSlide(index: number): void {
		if (index === this.currentIndex) return;
		clearInterval(this.intervalId);
		this.currentIndex = index;
		this.startAutoPlay();
	}
}
