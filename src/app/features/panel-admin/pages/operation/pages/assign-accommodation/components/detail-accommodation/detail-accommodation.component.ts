import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ViajeAlojamientoDisplay } from '../../../../models/operaciones-display.models';

@Component({
	selector: 'app-detail-accommodation',
	templateUrl: './detail-accommodation.component.html',
	styleUrl: './detail-accommodation.component.css',
})
export class DetailAccommodationComponent {
	@Input() isOpen = false;
	@Input() viaje: ViajeAlojamientoDisplay | null = null;

	@Output() closed = new EventEmitter<void>();

	cerrar(): void {
		this.closed.emit();
	}
}
