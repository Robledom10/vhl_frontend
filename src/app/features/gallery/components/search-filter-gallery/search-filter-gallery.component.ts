import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

export interface SearchFilters {
	year: number | null;
	site: string;
	activity: string;
}

@Component({
	selector: 'app-search-filter-gallery',
	templateUrl: './search-filter-gallery.component.html',
	styleUrl: './search-filter-gallery.component.css',
})
export class SearchFilterGalleryComponent {
	@Input() availableYears: number[] = [];
	@Input() siteOptions: string[] = [];
	@Input() activityOptions: string[] = [];

	@Output() search = new EventEmitter<SearchFilters>();
	@Output() yearChange = new EventEmitter<number | null>();

	selectedYear: number | null = null;
	selectedSite = 'Todos';
	selectedActivity = 'Todos';

	calendarOpen = false;
	siteOpen = false;
	actOpen = false;

	@HostListener('document:click')
	closeAll(): void {
		this.calendarOpen = false;
		this.siteOpen = false;
		this.actOpen = false;
	}

	toggleCalendar(event: Event): void {
		event.stopPropagation();
		const wasOpen = this.calendarOpen;
		this.closeAll();
		this.calendarOpen = !wasOpen;
	}

	toggleDropdown(type: 'site' | 'act', event: Event): void {
		event.stopPropagation();

		if (type === 'site') {
			const wasOpen = this.siteOpen;

			this.closeAll();

			this.siteOpen = !wasOpen;
		} else {
			const wasOpen = this.actOpen;
			this.closeAll();
			this.actOpen = !wasOpen;
		}
	}

	selectYear(year: number): void {
		this.selectedYear = year;
		this.calendarOpen = false;
		this.yearChange.emit(year);
	}

	clearDate(): void {
		this.selectedYear = null;
		this.calendarOpen = false;
		this.yearChange.emit(null);
	}

	selectOption(type: 'site' | 'act', value: string): void {
		if (type === 'site') {
			this.selectedSite = value;
		} else {
			this.selectedActivity = value;
		}

		this.closeAll();
	}

	onSearch(): void {
		const filters = {
			year: this.selectedYear,
			site: this.selectedSite,
			activity: this.selectedActivity,
		};

		this.search.emit(filters);
	}
}