import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SearchFilters } from '../search-filter-gallery/search-filter-gallery.component';

@Component({
	selector: 'app-filter-gallery',
	templateUrl: './filter-gallery.component.html',
	styleUrl: './filter-gallery.component.css',
})
export class FilterGalleryComponent {
	@Output() search = new EventEmitter<SearchFilters>();
	@Input() years: number[] = [];
	@Input() excursions: string[] = [];
	@Input() activities: string[] = [];

	readonly videosByYear: Record<number, string> = {
		2024: 'https://player.vimeo.com/video/1191694846?badge=0&autopause=0&player_id=0&app_id=58479&muted=1',
		2023: 'https://player.vimeo.com/video/1205347846?badge=0&autopause=0&player_id=0&app_id=58479&muted=1',
	};

	readonly defaultVideoUrl = 'https://player.vimeo.com/video/1191705756?badge=0&autopause=0&player_id=0&app_id=58479&muted=1';

	selectedYear: number | null = null;

	get effectiveYears(): number[] {
		const videoYears = Object.keys(this.videosByYear).map(Number);
		return [...new Set([...this.years, ...videoYears])].sort((a, b) => b - a);
	}

	onYearChange(year: number | null): void {
		this.selectedYear = year;
	}

	onSearch(filters: SearchFilters) {
		this.search.emit(filters);
	}
}
