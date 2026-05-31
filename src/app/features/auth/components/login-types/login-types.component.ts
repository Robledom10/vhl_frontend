import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-login-types',
	templateUrl: './login-types.component.html',
	styleUrl: './login-types.component.css'
})
export class LoginTypesComponent {

	@Input() text: string = '';
}
