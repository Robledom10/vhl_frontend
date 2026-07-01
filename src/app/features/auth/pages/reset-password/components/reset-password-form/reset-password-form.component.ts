import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../../../core/services/auth.service';
import { passwordMatchValidator } from '../../../../../../core/validators/custom.validators';

@Component({
	selector: 'app-reset-password-form',
	templateUrl: './reset-password-form.component.html',
	styleUrl: './reset-password-form.component.css'
})
export class ResetPasswordFormComponent implements OnInit {

	isLoading: boolean = false;
	submitted: boolean = false;
	resetDone: boolean = false;
	errorMessage: string = '';
	private token: string = '';

	constructor(
		private fb: FormBuilder,
		private authService: AuthService,
		private route: ActivatedRoute,
		private router: Router
	) { }

	resetForm = this.fb.group({
		newPassword: ['', [Validators.required, Validators.minLength(6)]],
		confirmPassword: ['', [Validators.required]]
	}, { validators: passwordMatchValidator });

	ngOnInit() {
		this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
		if (!this.token) {
			this.errorMessage = 'El enlace de recuperación no es válido.';
		}
	}

	onSubmit() {
		this.submitted = true;
		this.errorMessage = '';

		if (this.resetForm.invalid || !this.token) {
			this.resetForm.markAllAsTouched();
			return;
		}

		this.isLoading = true;

		this.authService.resetPassword({
			token: this.token,
			newPassword: this.resetForm.value.newPassword!,
			confirmPassword: this.resetForm.value.confirmPassword!
		}).subscribe({
			next: () => {
				this.isLoading = false;
				this.resetDone = true;
				setTimeout(() => this.router.navigate(['/auth/login']), 3000);
			},
			error: (err) => {
				this.isLoading = false;
				this.errorMessage = err.message ?? 'No se pudo restablecer la contraseña. El enlace puede haber expirado.';
			}
		});
	}

	togglePasswordVisibility(inputId: string): void {
		const input = document.getElementById(inputId) as HTMLInputElement;
		if (input) {
			input.type = input.type === 'password' ? 'text' : 'password';
		}
	}

	get f() {
		return this.resetForm.controls;
	}
}
