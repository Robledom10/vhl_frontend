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

	onSearch(filters: SearchFilters) {
		this.search.emit(filters);
	}
}
