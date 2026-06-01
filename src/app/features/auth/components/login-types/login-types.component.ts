import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'app-login-types',
	templateUrl: './login-types.component.html',
	styleUrl: './login-types.component.css'
})
export class LoginTypesComponent {

	@Input() text = '';

	@Output() googleClicked = new EventEmitter<void>();

	loginGoogle() {
		this.googleClicked.emit();
	}
}
