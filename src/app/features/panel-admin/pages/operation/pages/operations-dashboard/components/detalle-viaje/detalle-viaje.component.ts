import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'app-detalle-viaje',
	templateUrl: './detalle-viaje.component.html',
	styleUrl: './detalle-viaje.component.css'
})

export class DetalleViajeComponent {
	@Input() viaje: any;

	@Output() cerrar = new EventEmitter<void>();

	get estadoLabel(): string {

		if (!this.viaje?.estado) {
			return 'Sin viaje';
		}

		const estados: Record<string, string> = {
			programado: 'Programado',
			activo: 'Activo',
			'en-curso': 'En curso',
			finalizado: 'Finalizado'
		};

		return estados[this.viaje.estado] || this.viaje.estado;
	}
}