import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

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

  close(): void {
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('sheet-overlay')) {
      this.close();
    }
  }
}