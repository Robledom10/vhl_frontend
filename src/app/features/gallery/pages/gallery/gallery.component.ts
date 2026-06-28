import { Component, OnInit, HostListener } from '@angular/core';
import { MediaResponse, MediaService } from '../../../../core/services/media.service';
import { SearchFilters } from '../../components/search-filter-gallery/search-filter-gallery.component';

@Component({
	selector: 'app-gallery',
	templateUrl: './gallery.component.html',
	styleUrl: './gallery.component.css',
})
export class GalleryComponent implements OnInit {
	media: MediaResponse[] = [];
	allMedia: MediaResponse[] = [];

	lightboxOpen = false;
	lightboxImage = '';
	lightboxAlt = '';
	lightboxIndex = 0;

	@HostListener('document:keydown.escape')
	onEscape() {
		this.closeLightbox();
	}

	years: number[] = [];
	excursions: string[] = [];
	activities: string[] = [];

	constructor(private mediaService: MediaService) { }

	ngOnInit(): void {
		this.loadMedia();
	}

	loadMedia(): void {
		this.mediaService.getAll().subscribe({
			next: (data) => {
				this.allMedia = data;
				this.media = data;

				this.years = [...new Set(data.map((m) => m.year))].sort(
					(a, b) => b - a,
				);

				this.excursions = ['Todos', ...new Set(data.map((m) => m.excursion))];

				this.activities = ['Todos', ...new Set(data.map((m) => m.activity))];
			},
		});
	}

	openLightbox(item: MediaResponse, index: number): void {
		this.lightboxIndex = index;
		this.lightboxImage = item.url;
		this.lightboxAlt = item.excursion;
		this.lightboxOpen = true;
		document.body.style.overflow = 'hidden';
	}

	closeLightbox(): void {
		this.lightboxOpen = false;
		document.body.style.overflow = '';
	}

	prevImage(): void {
		this.lightboxIndex = (this.lightboxIndex - 1 + this.media.length) % this.media.length;
		this.lightboxImage = this.media[this.lightboxIndex].url;
		this.lightboxAlt = this.media[this.lightboxIndex].excursion;
	}

	nextImage(): void {
		this.lightboxIndex = (this.lightboxIndex + 1) % this.media.length;
		this.lightboxImage = this.media[this.lightboxIndex].url;
		this.lightboxAlt = this.media[this.lightboxIndex].excursion;
	}

	onSearch(filters: SearchFilters): void {
		this.media = this.allMedia.filter((item) => {
			const matchYear = !filters.year || item.year === filters.year;

			const matchSite =
				!filters.site ||
				filters.site === 'Todos' ||
				item.excursion === filters.site;

			const matchActivity =
				!filters.activity ||
				filters.activity === 'Todos' ||
				item.activity === filters.activity;

			return matchYear && matchSite && matchActivity;
		});
	}
}
