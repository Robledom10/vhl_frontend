import { Component } from '@angular/core';

@Component({
	selector: 'app-footer',
	templateUrl: './footer.component.html',
	styleUrls: ['./footer.component.css'],
})
export class FooterComponent {
	email: string = '';

	onSubscribe(): void {
		if (this.email && this.email.includes('@')) {
			console.log('Suscrito:', this.email);
			this.email = '';
			// Aquí conectas con tu servicio de email
		}
	}
}
