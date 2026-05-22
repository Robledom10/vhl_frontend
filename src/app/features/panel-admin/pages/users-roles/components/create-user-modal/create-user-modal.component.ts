import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
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

  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
  ) {}

  formOptions: AbstractControlOptions = {
    validators: passwordMatchValidator,
  };

  registerForm = this.fb.group(
    {
      firstName: ['', [Validators.required, Validators.minLength(3)]],

      lastName: ['', [Validators.required]],

      email: ['', [Validators.required, Validators.email]],

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
      documentType: formValue.documentType!,
      documentNumber: formValue.documentNumber!,
      password: formValue.password!,
    };

    this.authService.register(request).subscribe({
      next: () => {
        this.isLoading = false;

        this.showToast = true;

        this.created.emit();

        setTimeout(() => {
          this.showToast = false;

          this.closeModal();
        }, 2500);
      },

      error: (err) => {
        console.error(err);

        this.isLoading = false;

        this.errorMessage =
          err?.error?.message || 'No se pudo crear el usuario';

        this.showErrorModal = true;
      },
    });
  }

  closeConfirmCreateModal(): void {
    this.showConfirmCreateModal = false;
  }

  // =========================
  // DROPDOWN
  // =========================

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
}