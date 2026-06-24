import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ViajeTransporteDisplay } from '../../../../models/operaciones-display.models';

@Component({
	selector: 'app-detail-transport',
	templateUrl: './detail-transport.component.html',
	styleUrl: './detail-transport.component.css',
})
export class DetailTransportComponent {
	@Input() isOpen = false;
	@Input() viaje: ViajeTransporteDisplay | null = null;

	@Output() closed = new EventEmitter<void>();

	cerrar(): void {
		this.closed.emit();
	}
}
