import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
	selector: 'app-packages',
	templateUrl: './packages.component.html',
	styleUrl: './packages.component.css'
})
export class PackagesComponent implements OnInit, OnDestroy {

	heroImages: string[] = [
		'https://res.cloudinary.com/dqcviyp18/image/upload/v1782623845/pexels-beach-1852945_jrrpig.jpg',
		'https://res.cloudinary.com/dqcviyp18/image/upload/v1782623914/makalu-colombia-4938090_y9hhv7.jpg',
		'https://res.cloudinary.com/dqcviyp18/image/upload/v1782625597/herney-island-2056892_w5h2fm.jpg',
		'https://res.cloudinary.com/dqcviyp18/image/upload/v1782623932/graphicalbrain-cartagena-de-indias-674706_y8bglf.jpg',
		'https://res.cloudinary.com/dqcviyp18/image/upload/v1782623873/schaferle-island-2482200_uefsbo.jpg',
		'https://res.cloudinary.com/dqcviyp18/image/upload/v1782623949/bergslay-guatape-4298658_tj9jvo.jpg',
		'https://res.cloudinary.com/dqcviyp18/image/upload/v1782625645/frarthega0-paipa-4931315_m9815y.jpg',
		'https://res.cloudinary.com/dqcviyp18/image/upload/v1782622037/pexels-asadphoto-1266831_it23cu.jpg',
	];

	currentHeroIndex = 0;
	private slideTimer: ReturnType<typeof setInterval> | null = null;

	ngOnInit(): void {
		this.slideTimer = setInterval(() => {
			this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroImages.length;
		}, 6000);
	}

	ngOnDestroy(): void {
		if (this.slideTimer) {
			clearInterval(this.slideTimer);
		}
	}
}
