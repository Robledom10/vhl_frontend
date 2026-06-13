import { Component, Input, Output, EventEmitter } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { Reservation } from '../../models/reservations.models';

@Component({
  selector: 'app-reservation-detail-sheet',
  templateUrl: './reservation-detail-sheet.component.html',
  styleUrl: './reservation-detail-sheet.component.css',
  animations: [
    trigger('overlayAnim', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('250ms ease', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class ReservationDetailSheetComponent {
  @Input() isOpen = false;
  @Input() reservation: Reservation | null = null;
  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('sheet-overlay')) {
      this.close();
    }
  }

  getEstadoClass(): string {
    if (!this.reservation) return '';
    return {
      'Confirmada': 'estado-confirmada',
      'Pendiente':  'estado-pendiente',
      'Cancelada':  'estado-cancelada',
      'Pasada':     'estado-pasada',
      'Completada': 'estado-completada',
      'Bloqueada':  'estado-bloqueada',
    }[this.reservation.estado] ?? '';
  }

  formatTotal(total: number): string {
    return total.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  }
}