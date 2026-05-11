import { Component, EventEmitter, HostListener, Output } from '@angular/core';

export interface SearchFilters {
  year: number | null;
  month: number | null;
  site: string;
  activity: string;
}

@Component({
  selector: 'app-search-filter-gallery',
  templateUrl: './search-filter-gallery.component.html',
  styleUrl: './search-filter-gallery.component.css'
})
export class SearchFilterGalleryComponent {

  @Output() search = new EventEmitter<SearchFilters>();

  calYear = new Date().getFullYear();
  selectedYear: number | null = null;
  selectedMonth: number | null = null;
  selectedSite = 'Todos';
  selectedActivity = 'Todos';

  calendarOpen = false;
  siteOpen = false;
  actOpen = false;

  dayLabels = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
  months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  siteOptions = ['Todos', 'Playa', 'Montaña', 'Ciudad', 'Selva', 'Desierto'];
  activityOptions = ['Todos', 'Senderismo', 'Buceo', 'Ciclismo', 'Kayak', 'Escalada'];

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

  changeYear(dir: number): void {
    this.calYear += dir;
  }

  selectMonth(index: number): void {
    this.selectedYear = this.calYear;
    this.selectedMonth = index;
    this.calendarOpen = false;
  }

  isCurrentMonth(index: number): boolean {
    const now = new Date();
    return index === now.getMonth() && this.calYear === now.getFullYear();
  }

  selectOption(type: 'site' | 'act', value: string): void {
    if (type === 'site') this.selectedSite = value;
    else this.selectedActivity = value;
    this.closeAll();
  }

  onSearch(): void {
    this.search.emit({
      year: this.selectedYear,
      month: this.selectedMonth,
      site: this.selectedSite,
      activity: this.selectedActivity
    });
  }
}