import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';

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
  requirements: string[];
}

@Component({
  selector: 'app-package-detail-sheet',
  templateUrl: './package-detail-sheet.component.html',
  styleUrl: './package-detail-sheet.component.css',
})
export class PackageDetailSheetComponent implements OnChanges, OnDestroy {
  @Input() isOpen = false;
  @Input() package: PackageDetail | null = null;
  @Output() closed = new EventEmitter<void>();

  visible = false;
  animating = false;
  private scrollY = 0;

  ngOnChanges(): void {
    if (this.isOpen) {
      this.visible = true;
      setTimeout(() => (this.animating = true), 10);
      this.blockScroll();
    } else {
      this.animating = false;
      setTimeout(() => (this.visible = false), 420);
      this.restoreScroll();
    }
  }

  ngOnDestroy(): void {
    this.restoreScroll();
  }

private blockScroll(): void {
  this.scrollY = window.scrollY;
  document.documentElement.style.overflow = 'hidden';
  document.documentElement.style.position = 'fixed';
  document.documentElement.style.top = `-${this.scrollY}px`;
  document.documentElement.style.width = '100%';
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${this.scrollY}px`;
  document.body.style.width = '100%';
}

private restoreScroll(): void {
  document.documentElement.style.overflow = '';
  document.documentElement.style.position = '';
  document.documentElement.style.top = '';
  document.documentElement.style.width = '';
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  window.scrollTo(0, this.scrollY);
}

  get infoRows(): InfoRow[] {
    if (!this.package) return [];
    return [
      { label: 'Destinos',     value: this.package.destinations,  icon: 'fa-regular fa-map' },
      { label: 'Duración',     value: this.package.duration,       icon: 'fa-regular fa-clock' },
      { label: 'Salida desde', value: this.package.departurePlace, icon: 'fa-solid fa-route' },
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