import { Component } from '@angular/core';

@Component({
	selector: 'app-search-filter',
	templateUrl: './search-filter.component.html',
	styleUrl: './search-filter.component.css',
})
export class SearchFilterComponent {
	showCalendar = false;

	fechaSalida = '';
	fechaSalidaISO = ''; // formato YYYY-MM-DD (IMPORTANTE para el componente)

	// abrir/cerrar calendario
	toggleCalendar(event: Event) {
		event.stopPropagation();
		this.showCalendar = !this.showCalendar;
	}

	// recibir fecha del calendario
	onDateSelected(date: string) {
		this.fechaSalidaISO = date;
		const [year, month, day] = date.split('-');
		this.fechaSalida = `${day}/${month}/${year}`;
		this.showCalendar = false;
	}
}
