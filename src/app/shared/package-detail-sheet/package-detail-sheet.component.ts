import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

export interface InfoRow {
  label: string;
  value: string;
  icon: string;
}

export interface PackageDetail {
  title: string;
  subtitle: string;
  spotsAvailable: number;
  price: number;
  destinations: string;
  duration: string;
  departurePlace: string;
  date: string;
  accommodation: string;
  transport: string;
  mainImage: string;
  galleryImages?: string[];
  itinerary: { day: string; desc: string }[];
  includes: string[];
  notIncludes: string[];
  cancellation: string[];
}

@Component({
  selector: 'app-package-detail-sheet',
  templateUrl: './package-detail-sheet.component.html',
  styleUrl: './package-detail-sheet.component.css',
})
export class PackageDetailSheetComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() package: PackageDetail | null = null;
  @Output() closed = new EventEmitter<void>();

  visible = false;
  animating = false;

  ngOnChanges(): void {
    if (this.isOpen) {
      this.visible = true;
      setTimeout(() => (this.animating = true), 10);
    } else {
      this.animating = false;
      setTimeout(() => (this.visible = false), 420);
    }
  }

  get infoRows(): InfoRow[] {
    if (!this.package) return [];
    return [
      { label: 'Destinos',     value: this.package.destinations,   icon: 'fa-regular fa-map' },
      { label: 'Duración',     value: this.package.duration,       icon: 'fa-regular fa-clock' },
      { label: 'Salida desde', value: this.package.departurePlace, icon: 'fa-solid fa-route ' },
      { label: 'Fecha',        value: this.package.date,           icon: 'fa-regular fa-calendar' },
      { label: 'Alojamiento',  value: this.package.accommodation,  icon: 'fa-solid fa-bed' },
      { label: 'Transporte',   value: this.package.transport,      icon: 'fa-solid fa-bus-simple' },
    ];
  }

  get galleryImages(): string[] {
    return this.package?.galleryImages ?? [];
  }

  close(): void {
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('sheet-overlay')) {
      this.close();
    }
  }
}