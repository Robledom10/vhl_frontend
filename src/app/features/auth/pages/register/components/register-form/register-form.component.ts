import { Component, HostListener } from '@angular/core';
import { AuthService } from '../../../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { RegisterRequest } from '../../../../models/auth.model';
import { passwordMatchValidator, strongPasswordValidator } from '../../../../../../core/validators/custom.validators';
import { FormBuilder, Validators, AbstractControlOptions } from '@angular/forms';
import { GoogleService } from '../../../../../../core/services/google.service';

@Component({
	selector: 'app-register-form',
	templateUrl: './register-form.component.html',
	styleUrl: './register-form.component.css',
})

export class RegisterFormComponent {
	submitted = false;
	errorMessage: string | null = null;
	isLoading: boolean = false;
	currentStep: number = 1;

	documentDropdownOpen = false;

	selectedDocumentType = '';

	documentTypes = [
		'Cedula Ciudadania',
		'Tarjeta Identidad',
		'Cedula Extranjeria',
		'Pasaporte',
		'Visa',
	];

	constructor(
		private fb: FormBuilder,
		private authService: AuthService,
		private router: Router,
		private googleService: GoogleService
	) { }

	formOptions: AbstractControlOptions = {
		validators: passwordMatchValidator,
	};

	registerForm = this.fb.group(
		{
			firstName: ['', [Validators.required, Validators.minLength(3)]],
			lastName: ['', [Validators.required]],
			email: ['', [Validators.required, Validators.email]],
			documentType: ['', [Validators.required]],
			documentNumber: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(11)]],
			password: ['', [Validators.required, Validators.minLength(8), strongPasswordValidator],],
			confirmPassword: ['', [Validators.required]],
			terms: [false, [Validators.requiredTrue]],
		},
		this.formOptions,
	);

	onSubmit() {
		this.submitted = true;
		this.errorMessage = null;

		if (this.registerForm.invalid) {
			this.registerForm.markAllAsTouched();
			return;
		}

		this.isLoading = true;

		const formValue = this.registerForm.value;

		const request: RegisterRequest = {
			firstName: formValue.firstName!,
			lastName: formValue.lastName!,
			email: formValue.email!,
			documentType: formValue.documentType!,
			documentNumber: formValue.documentNumber!,
			password: formValue.password!,
		};

		this.authService.register(request).subscribe({
			next: (res) => {
				console.log('Usuario creado:', res.user);
				this.router.navigate(['/home']);
			},

			error: (err) => {
				console.log('ERROR BACKEND:', err);

				//Detectar conflicto de email
				if (err.status === 409) {
					this.registerForm.get('email')?.setErrors({ emailExists: true });
				}

				this.errorMessage = err.message;
			},
		});
	}

	// Funciones para mostrar/ocultar contraseña
	togglePasswordVisibility(inputId: string): void {
		const input = document.getElementById(inputId) as HTMLInputElement;
		if (input) {
			input.type = input.type === 'password' ? 'text' : 'password';
		}
	}

	// Función para abrir el selector de fecha en dispositivos móviles
	openDatePicker(event: any) {
		const input = event.target as HTMLInputElement;

		if (input.showPicker) {
			input.showPicker();
		}
	}

	// Getter para acceder fácilmente a los controles del formulario en la plantilla
	get f() {
		return this.registerForm.controls;
	}

	nextStep() {
		// Validar SOLO los campos del paso 1
		// Marcar solo campos del paso 1
		this.f.firstName.markAsTouched();
		this.f.lastName.markAsTouched();
		this.f.email.markAsTouched();

		if (
			this.f.firstName.invalid ||
			this.f.lastName.invalid ||
			this.f.email.invalid
		) {
			return;
		}

		this.currentStep = 2;
	}

	prevStep() {
		this.currentStep = 1;
	}

	//   Select del tipo de documento
	toggleDocumentDropdown(event: Event): void {
		event.stopPropagation();
		this.documentDropdownOpen = !this.documentDropdownOpen;
	}

	selectDocumentType(option: string): void {
		this.selectedDocumentType = option;

		this.f.documentType.setValue(option);
		this.f.documentType.markAsTouched();

		this.documentDropdownOpen = false;
	}

	@HostListener('document:click')
	closeDropdowns(): void {
		this.documentDropdownOpen = false;
	}

	// Registro con Google
	registerWithGoogle() {

		this.googleService.initGoogle((credential) => {

			this.authService.googleLogin(credential)
				.subscribe({
					next: () => {
						this.router.navigate(['/home']);
					},
					error: (err) => {
						console.error(err);
					}
				});

		});

		this.googleService.prompt();
	}
}