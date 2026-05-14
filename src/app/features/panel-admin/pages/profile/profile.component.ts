import { Component, HostListener } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
import { minimumAgeValidator } from '../../../../core/validators/custom.validators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  isEditing = false;
  submitted = false;

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
    public authService: AuthService,
    private fb: FormBuilder,
  ) {}

  profileForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(3)]],

    lastName: ['', [Validators.required]],

    email: ['', [Validators.required, Validators.email]],

    documentType: ['', [Validators.required]],

    documentNumber: [
      '',
      [Validators.required, Validators.minLength(6), Validators.maxLength(11)]],

    phone: ['', [Validators.required,  Validators.minLength(10), Validators.maxLength(15)]],

    birthDate: ['', [Validators.required, minimumAgeValidator(18)]],

    state: ['', [Validators.required]],

    city: ['', [Validators.required]],

    address: ['', [Validators.required]],
  });

  get f() {
    return this.profileForm.controls;
  }

  hiddenRoles = ['ROLE_CLIENT'];

  get user() {
    return this.authService.getUser();
  }

  get displayRole(): string | null {
    const role = this.user?.role;

    if (!role || this.hiddenRoles.includes(role)) {
      return null;
    }

    const roleMap: { [key: string]: string } = {
      ADMIN: 'Administrador',
    };

    return roleMap[role] || role;
  }

  enableEdit() {
    this.isEditing = true;

    this.profileForm.patchValue({
      firstName: this.user?.firstName || '',
      lastName: this.user?.lastName || '',
      email: this.user?.email || '',
    });
  }

  cancelEdit() {
    this.isEditing = false;

    this.profileForm.reset();

    this.submitted = false;
  }

  saveProfile() {
    this.submitted = true;

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    console.log(this.profileForm.value);

    // PUT AL BACKEND

    this.isEditing = false;
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
}
