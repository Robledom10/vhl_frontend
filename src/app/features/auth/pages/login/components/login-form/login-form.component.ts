import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../../core/services/auth.service';
import { LoginRequest } from '../../../../models/auth.model';
import { GoogleService } from '../../../../../../core/services/google.service';

@Component({
	selector: 'app-login-form',
	templateUrl: './login-form.component.html',
	styleUrl: './login-form.component.css'
})
export class LoginFormComponent {

	loginError: boolean = false;
	isLoading: boolean = false;
	submitted: boolean = false;

	constructor(
		private fb: FormBuilder,
		private authService: AuthService,
		private router: Router,
		private googleService: GoogleService
	) { }

	loginForm = this.fb.group({
		email: ['', [Validators.required, Validators.email]],
		password: ['', [Validators.required]]
	});

	onSubmit() {
		// Limpiar error previo
		this.loginError = false;
		this.submitted = true;

		// Validar formulario
		if (this.loginForm.invalid) {
			this.loginForm.markAllAsTouched();
			return;
		}

		// Mostrar estado de carga
		this.isLoading = true;
		const formValue = this.loginForm.value;

		const request: LoginRequest = {
			email: formValue.email!,
			password: formValue.password!
		};

		this.authService.login(request).subscribe({
			next: () => {

				this.isLoading = false;

				// Redirigir al dashboard o home
				this.redirectUserByRole();
			},
			error: (err) => {
				console.error('Error en el login:', err);
				this.isLoading = false;

				// Mostrar error
				this.loginError = true;
			}
		});
	}

	// Login con Google
	loginGoogle() {
		this.googleService.loginPopup();
	}

	/**
	 * Centraliza la lógica de redirección evaluando el rol del usuario autenticado
	 */
	private redirectUserByRole() {
		const user = this.authService.getUser();
		const role = user?.role;

		if (role === 'ADMIN' || role === 'GUIDE') {
			this.router.navigate(['/panel-admin/control-panel']);
		} else {
			this.router.navigate(['/home']);
		}
	}

	// Función para mostrar/ocultar contraseña
	togglePasswordVisibility(inputId: string): void {
		const input = document.getElementById(inputId) as HTMLInputElement;
		if (input) {
			input.type = input.type === 'password' ? 'text' : 'password';
		}
	}

	// Getter para acceder fácilmente a los controles del formulario
	get f() {
		return this.loginForm.controls;
	}
}