import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
	selector: 'app-packages',
	templateUrl: './packages.component.html',
	styleUrl: './packages.component.css'
})
export class PackagesComponent implements OnInit, OnDestroy {

	heroImages: string[] = [
		'https://res.cloudinary.com/dqcviyp18/image/upload/q_auto/f_auto/v1777919816/D%C3%ADa3-26_wxkcpo.jpg',
		'https://res.cloudinary.com/dqcviyp18/image/upload/v1782601660/Medellin01_i5basv.jpg',
		'https://res.cloudinary.com/dqcviyp18/image/upload/v1782601746/SanAndres03_a8pebk.jpg',
		'https://res.cloudinary.com/dqcviyp18/image/upload/v1782601704/Cocora01_ifve7z.jpg',
		'https://res.cloudinary.com/dqcviyp18/image/upload/v1782601618/Cartagena03_nqbhwa.jpg',
		'https://res.cloudinary.com/dqcviyp18/image/upload/v1782601711/Salento03_nh1ajk.jpg',
		'https://res.cloudinary.com/dqcviyp18/image/upload/v1778019081/neidygirado21-cartagena-de-indias-4788526.jpg_pt4jpn.jpg',
		'https://res.cloudinary.com/dqcviyp18/image/upload/v1781206500/Medellin03_zsvagf.jpg',
		'https://res.cloudinary.com/dqcviyp18/image/upload/v1782601720/Salento04_o5zm4l.jpg',
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
