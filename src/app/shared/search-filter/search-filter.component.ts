import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-search-filter',
	templateUrl: './search-filter.component.html',
	styleUrl: './search-filter.component.css',
})
export class SearchFilterComponent implements OnInit {
	showCalendar = false;

	destino = '';
	personas: number | null = null;
	fechaSalida = '';
	fechaSalidaISO = ''; // YYYY-MM-DD

	constructor(private router: Router, private route: ActivatedRoute) { }

	ngOnInit(): void {
		// Si ya hay params en la URL (ej: llegando desde home), pre-rellenar el filtro
		this.route.queryParams.subscribe(params => {
			if (params['destino']) this.destino = params['destino'];
			if (params['personas']) this.personas = +params['personas'];
			if (params['fecha']) {
				this.fechaSalidaISO = params['fecha'];
				const [y, m, d] = params['fecha'].split('-');
				this.fechaSalida = `${d}/${m}/${y}`;
			}
		});
	}

	toggleCalendar(event: Event): void {
		event.stopPropagation();
		this.showCalendar = !this.showCalendar;
	}

	onDateSelected(date: string): void {
		this.fechaSalidaISO = date;
		const [y, m, d] = date.split('-');
		this.fechaSalida = `${d}/${m}/${y}`;
		this.showCalendar = false;
	}

	buscar(): void {
		const queryParams: Record<string, string | number> = {};

		if (this.destino?.trim()) queryParams['destino'] = this.destino.trim();
		if (this.personas) queryParams['personas'] = this.personas;
		if (this.fechaSalidaISO) queryParams['fecha'] = this.fechaSalidaISO;

		// Siempre navega a /packages con los filtros
		this.router.navigate(['/packages'], { queryParams });
	}

	limpiar(): void {
		this.destino = '';
		this.personas = null;
		this.fechaSalida = '';
		this.fechaSalidaISO = '';
		this.router.navigate(['/packages'], { queryParams: {} });
	}

	get hayFiltrosActivos(): boolean {
		return !!(this.destino || this.personas || this.fechaSalidaISO);
	}
}