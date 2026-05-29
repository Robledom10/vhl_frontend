import { Component, OnInit } from '@angular/core';

import {
  MediaResponse,
  MediaService,
} from '../../../../core/services/media.service';

@Component({
  selector: 'app-gallery-admin',
  templateUrl: './gallery-admin.component.html',
  styleUrl: './gallery-admin.component.css',
})
export class GalleryAdminComponent implements OnInit {
  mediaList: MediaResponse[] = [];

  filteredMedia: MediaResponse[] = [];

  groupedMedia: { [key: string]: MediaResponse[] } = {};

  showModal = false;

  loading = false;

  searchTerm = '';

  selectedYear = '';

  selectedExcursion = '';

  selectedActivity = '';

  selectedType = '';

  yearDropdownOpen = false;

  excursionDropdownOpen = false;

  activityDropdownOpen = false;

  typeDropdownOpen = false;

  selectedMedia: MediaResponse | null = null;

  years: number[] = [];

  excursions: string[] = [];

  activities: string[] = [];

  sortYearsDesc = (a: any, b: any): number => {
    return Number(b.key) - Number(a.key);
  };

  constructor(private mediaService: MediaService) {}

  ngOnInit(): void {
    this.loadMedia();
  }

  loadMedia() {
    this.loading = true;

    this.mediaService.getAll().subscribe({
      next: (data) => {
        this.mediaList = data;

        this.filteredMedia = data;

        this.extractFilters();

        this.groupMedia();

        this.loading = false;
      },

      error: (err) => {
        console.error(err);

        this.loading = false;
      },
    });
  }

  extractFilters() {
    const currentYear = new Date().getFullYear();

    this.years = [];

    for (let year = currentYear; year >= 2023; year--) {
      this.years.push(year);
    }

    this.excursions = [...new Set(this.mediaList.map((m) => m.excursion))];

    this.activities = [...new Set(this.mediaList.map((m) => m.activity))];
  }

  applyFilters() {
    this.filteredMedia = this.mediaList.filter((media) => {
      const matchesSearch = media.excursion
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase());

      const matchesYear =
        !this.selectedYear || media.year.toString() === this.selectedYear;

      const matchesExcursion =
        !this.selectedExcursion || media.excursion === this.selectedExcursion;

      const matchesLocation =
        !this.selectedActivity || media.activity === this.selectedActivity;

      const matchesType =
        !this.selectedType || media.type === this.selectedType;

      return (
        matchesSearch &&
        matchesYear &&
        matchesExcursion &&
        matchesLocation &&
        matchesType
      );
    });

    this.groupMedia();
  }

  groupMedia() {
    this.groupedMedia = {};

    this.filteredMedia.forEach((media) => {
      const year = media.year.toString();

      if (!this.groupedMedia[year]) {
        this.groupedMedia[year] = [];
      }

      this.groupedMedia[year].push(media);
    });
  }

  get selectedTypeLabel(): string {
    if (this.selectedType === 'IMAGE') return 'Imagen';

    if (this.selectedType === 'VIDEO') return 'Video';

    return 'Actividad';
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedMedia = null;
    this.loadMedia();
  }

  deleteMedia(id: string) {
    const confirmed = confirm('¿Seguro que desea eliminar este archivo?');

    if (!confirmed) return;

    this.mediaService.deleteMedia(id).subscribe({
      next: () => {
        this.loadMedia();
      },

      error: (err) => {
        console.error(err);
      },
    });
  }

  editMedia(media: MediaResponse) {
    this.selectedMedia = media;

    this.showModal = true;
  }

  toggleExcursionDropdown() {
    this.excursionDropdownOpen = !this.excursionDropdownOpen;
  }

  toggleYearDropdown() {
    this.yearDropdownOpen = !this.yearDropdownOpen;
  }

  toggleActivityropdown() {
    this.activityDropdownOpen = !this.activityDropdownOpen;
  }

  toggleTypeDropdown() {
    this.typeDropdownOpen = !this.typeDropdownOpen;
  }

  selectYear(year: string) {
    this.selectedYear = year;

    this.yearDropdownOpen = false;

    this.applyFilters();
  }

  selectActivity(activity: string) {
    this.selectedActivity = activity;

    this.activityDropdownOpen = false;

    this.applyFilters();
  }

  selectType(type: string) {
    this.selectedType = type;

    this.typeDropdownOpen = false;

    this.applyFilters();
  }

  selectExcursion(excursion: string) {
    this.selectedExcursion = excursion;

    this.excursionDropdownOpen = false;

    this.applyFilters();
  }
}
