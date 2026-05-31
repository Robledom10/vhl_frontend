import { Component, OnInit } from '@angular/core';
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
