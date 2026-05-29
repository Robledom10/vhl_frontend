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

  selectedLocation = '';

  selectedType = '';

  yearDropdownOpen = false;

  locationDropdownOpen = false;

  typeDropdownOpen = false;

  years: number[] = [];

  locations: string[] = [];

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
    this.years = [...new Set(this.mediaList.map((m) => m.year))].sort(
      (a, b) => b - a,
    );

    this.locations = [...new Set(this.mediaList.map((m) => m.location))];
  }

  applyFilters() {
    this.filteredMedia = this.mediaList.filter((media) => {
      const matchesSearch = media.excursion
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase());

      const matchesYear =
        !this.selectedYear || media.year.toString() === this.selectedYear;

      const matchesLocation =
        !this.selectedLocation || media.location === this.selectedLocation;

      const matchesType =
        !this.selectedType || media.type === this.selectedType;

      return matchesSearch && matchesYear && matchesLocation && matchesType;
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

  toggleYearDropdown() {
    this.yearDropdownOpen = !this.yearDropdownOpen;
  }

  toggleLocationDropdown() {
    this.locationDropdownOpen = !this.locationDropdownOpen;
  }

  toggleTypeDropdown() {
    this.typeDropdownOpen = !this.typeDropdownOpen;
  }

  selectYear(year: string) {
    this.selectedYear = year;

    this.yearDropdownOpen = false;

    this.applyFilters();
  }

  selectLocation(location: string) {
    this.selectedLocation = location;

    this.locationDropdownOpen = false;

    this.applyFilters();
  }

  selectType(type: string) {
    this.selectedType = type;

    this.typeDropdownOpen = false;

    this.applyFilters();
  }
}
