import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OperacionesService } from '../../../../core/services/operaciones.service';
import { Viaje } from '../../../panel-admin/models/operaciones.models';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {

	proximoViaje: Viaje | null = null;
	nombrePaquete = '';
	fechaSalida = '';

	constructor(
		private operacionesService: OperacionesService,
		private router: Router
	) { }

	ngOnInit(): void {
		this.cargarProximoViaje();
	}

	private cargarProximoViaje(): void {
		this.operacionesService.getViajes().subscribe({
			next: viajes => {
				const hoy = new Date();

				// Filtra viajes futuros no cancelados/finalizados, ordena por fecha de salida
				const activos = viajes
					.filter(v =>
						v.estado !== 'CANCELADO' &&
						v.estado !== 'FINALIZADO' &&
						new Date(v.fechaSalida) >= hoy
					)
					.sort((a, b) =>
						new Date(a.fechaSalida).getTime() - new Date(b.fechaSalida).getTime()
					);

				if (activos.length > 0) {
					this.proximoViaje = activos[0];
					this.fechaSalida = new Date(activos[0].fechaSalida)
						.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });

					// Obtener nombre del paquete
					this.operacionesService.getPaquete(activos[0].idPaquete).subscribe({
						next: paquete => { this.nombrePaquete = paquete.titulo; },
						error: () => { this.nombrePaquete = `Paquete ${activos[0].idPaquete}`; }
					});
				}
			},
			error: err => console.error('Error cargando viajes:', err)
		});
	}

	irAlPaquete(): void {
		if (!this.proximoViaje) return;
		this.router.navigate(['/packages'], {
			queryParams: { openPackage: this.proximoViaje.idPaquete }
		});
	}
}