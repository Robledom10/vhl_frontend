import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, AbstractControlOptions, Validators } from '@angular/forms';
import { AuthService } from '../../../../../../core/services/auth.service';
import { passwordMatchValidator, strongPasswordValidator } from '../../../../../../core/validators/custom.validators';

@Component({
	selector: 'app-create-user-modal',
	templateUrl: './create-user-modal.component.html',
	styleUrl: './create-user-modal.component.css',
})
export class CreateUserModalComponent {
	@Input() isOpen = false;
	@Output() closed = new EventEmitter<void>();
	@Output() created = new EventEmitter<void>();
	@Output() userCreated = new EventEmitter<{ firstName: string; lastName: string; documentNumber: string }>();
	currentStep = 1;
	step1Submitted = false;
	step2Submitted = false;
	isLoading = false;
	documentDropdownOpen = false;
	selectedDocumentType = '';

	documentTypes = [
		'Cedula Ciudadania',
		'Tarjeta Identidad',
		'Cedula Extranjeria',
		'Pasaporte',
		'Visa',
	];

	// =========================
	// MODALS
	// =========================

	showConfirmCreateModal = false;
	showErrorModal = false;
	showToast = false;
	toastTitle = '';
	toastMessage = '';
	toastType: 'success' | 'edit' | 'delete' | 'error' = 'success';
	errorMessage = '';

	constructor(
		private fb: FormBuilder,
		private authService: AuthService,
	) { }

	formOptions: AbstractControlOptions = {
		validators: passwordMatchValidator,
	};

	registerForm = this.fb.group(
		{
			firstName: ['', [Validators.required, Validators.minLength(3)]],
			lastName: ['', [Validators.required]],
			email: ['', [Validators.required, Validators.email]],
			phone: ['', [Validators.pattern(/^\+?[\d\s\-]{7,20}$/)]],
			documentType: ['', [Validators.required]],
			documentNumber: [
				'',
				[
					Validators.required,
					Validators.minLength(6),
					Validators.maxLength(11),
				],
			],
			password: [
				'',
				[Validators.required, Validators.minLength(8), strongPasswordValidator],
			],
			confirmPassword: ['', Validators.required],
		},
		this.formOptions,
	);

	get f() {
		return this.registerForm.controls;
	}

	// =========================
	// STEP 1
	// =========================

	nextStep(): void {
		this.step1Submitted = true;
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

	prevStep(): void {
		this.currentStep = 1;
	}

	// =========================
	// SUBMIT
	// =========================

	onSubmit(): void {
		this.step2Submitted = true;
		this.registerForm.markAllAsTouched();

		if (
			this.f.documentType.invalid ||
			this.f.documentNumber.invalid ||
			this.f.password.invalid ||
			this.f.confirmPassword.invalid ||
			this.registerForm.errors?.['mismatch']
		) {
			return;
		}

		// ABRIR MODAL DE CONFIRMACIÓN
		this.showConfirmCreateModal = true;
	}

	// =========================
	// CONFIRM CREATE USER
	// =========================

	confirmCreateUser(): void {
		this.showConfirmCreateModal = false;
		this.isLoading = true;
		const formValue = this.registerForm.value;

		const request = {
			firstName: formValue.firstName!,
			lastName: formValue.lastName!,
			email: formValue.email!,
			phone: formValue.phone || undefined,
			documentType: formValue.documentType!,
			documentNumber: formValue.documentNumber!,
			password: formValue.password!,
		};

		this.authService.register(request).subscribe({
			next: () => {
				this.isLoading = false;
				this.created.emit();
				this.userCreated.emit({
					firstName: formValue.firstName!,
					lastName: formValue.lastName!,
					documentNumber: formValue.documentNumber!,
				});
				this.showFeedbackToast('Usuario creado', `El usuario ${formValue.firstName} ${formValue.lastName} fue creado correctamente.`, 'success');

				setTimeout(() => {
					this.closeModal();
				}, 3000);
			},

			error: (err) => {
				this.isLoading = false;
				if (err?.status === 409) {
					this.errorMessage = 'Ya existe un usuario registrado con ese correo o número de documento.';
				} else {
					this.errorMessage = err?.message || err?.error?.message || 'No se pudo crear el usuario. Intente nuevamente.';
				}
				this.showErrorModal = true;
			},
		});
	}

	closeConfirmCreateModal(): void {
		this.showConfirmCreateModal = false;
	}

	togglePasswordVisibility(inputId: string): void {
		const input = document.getElementById(inputId) as HTMLInputElement;
		if (input) {
			input.type = input.type === 'password' ? 'text' : 'password';
		}
	}

	// =========================
	// DROPDOWN
	// =========================

	toggleDocumentDropdown(): void {
		this.documentDropdownOpen = !this.documentDropdownOpen;
	}

	selectDocumentType(option: string): void {
		this.selectedDocumentType = option;
		this.f.documentType.setValue(option);
		this.f.documentType.markAsTouched();
		this.documentDropdownOpen = false;
	}

	onModalClick(event: Event): void {
		event.stopPropagation();

		const target = event.target as HTMLElement;

		if (!target.closest('.custom-select')) {
			this.documentDropdownOpen = false;
		}
	}

	// =========================
	// CLOSE MODAL
	// =========================

	closeModal(): void {
		this.currentStep = 1;
		this.step1Submitted = false;
		this.step2Submitted = false;
		this.registerForm.reset();
		this.selectedDocumentType = '';
		this.documentDropdownOpen = false;
		this.closed.emit();
	}

	// =========================
	// ERROR
	// =========================

	closeErrorModal(): void {
		this.showErrorModal = false;
	}

	private showFeedbackToast(title: string, message: string, type: 'success' | 'edit' | 'delete' | 'error' = 'success'): void {
		this.toastTitle = title;
		this.toastMessage = message;
		this.toastType = type;
		this.showToast = true;
		setTimeout(() => { this.showToast = false; }, 3000);
	}
}