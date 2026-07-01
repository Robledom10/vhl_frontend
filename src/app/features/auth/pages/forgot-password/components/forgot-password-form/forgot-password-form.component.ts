import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../../../../core/services/auth.service';

@Component({
	selector: 'app-forgot-password-form',
	templateUrl: './forgot-password-form.component.html',
	styleUrl: './forgot-password-form.component.css'
})
export class ForgotPasswordFormComponent {

	isLoading: boolean = false;
	submitted: boolean = false;
	emailSent: boolean = false;
	errorMessage: string = '';

	constructor(
		private fb: FormBuilder,
		private authService: AuthService
	) { }

	forgotForm = this.fb.group({
		email: ['', [Validators.required, Validators.email]]
	});

	onSubmit() {
		this.submitted = true;
		this.errorMessage = '';

		if (this.forgotForm.invalid) {
			this.forgotForm.markAllAsTouched();
			return;
		}

		this.isLoading = true;

		this.authService.forgotPassword({ email: this.forgotForm.value.email! }).subscribe({
			next: () => {
				this.isLoading = false;
				this.emailSent = true;
			},
			error: () => {
				this.isLoading = false;
				this.errorMessage = 'No pudimos procesar tu solicitud. Intenta más tarde.';
			}
		});
	}

	get f() {
		return this.forgotForm.controls;
	}
}
