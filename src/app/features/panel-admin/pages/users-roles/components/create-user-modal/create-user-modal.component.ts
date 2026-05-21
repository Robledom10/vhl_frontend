import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import {
  FormBuilder,
  AbstractControlOptions,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../../../../core/services/auth.service';
import {
  passwordMatchValidator,
  strongPasswordValidator,
} from '../../../../../../core/validators/custom.validators';

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

  submitted = false;

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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
  ) {}

  formOptions: AbstractControlOptions = {
    validators: passwordMatchValidator,
  };

  registerForm = this.fb.group(
    {
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],

      documentType: ['', [Validators.required]],

      documentNumber: ['', [Validators.required]],

      password: [
        '',
        [Validators.required, Validators.minLength(8), strongPasswordValidator],
      ],

      confirmPassword: ['', Validators.required],

      terms: [true],
    },
    this.formOptions,
  );

  get f() {
    return this.registerForm.controls;
  }

  nextStep(): void {
    if (
      this.f.firstName.invalid ||
      this.f.lastName.invalid ||
      this.f.email.invalid
    ) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.currentStep = 2;
  }

  prevStep(): void {
    this.currentStep = 1;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

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

        this.created.emit();

        this.closeModal();
      },

      error: (err) => {
        console.error(err);

        this.isLoading = false;
      },
    });
  }

  toggleDocumentDropdown(event: Event): void {
    event.stopPropagation();

    this.documentDropdownOpen = !this.documentDropdownOpen;
  }

  selectDocumentType(option: string): void {
    this.selectedDocumentType = option;

    this.f.documentType.setValue(option);

    this.documentDropdownOpen = false;
  }

  @HostListener('document:click')
  closeDropdowns(): void {
    this.documentDropdownOpen = false;
  }

  closeModal(): void {
    this.currentStep = 1;

    this.registerForm.reset();

    this.selectedDocumentType = '';

    this.closed.emit();
  }
}
