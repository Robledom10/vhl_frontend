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
  // Calendario
  birthCalendarOpen = false;
  selectedBirthDate = '';

  // Funcionamiento del form
  isEditing = false;
  submitted = false;

  documentDropdownOpen = false;
  selectedDocumentType = '';

  documentTypes = [
    'Cedula Ciudadania',
    'Cedula Extranjeria',
    'Pasaporte',
    'Visa',
  ];

  constructor(
    public authService: AuthService,
    private fb: FormBuilder,
  ) {}

  profileForm = this.fb.group({
    firstName: ['', [Validators.minLength(3)]],
    lastName: [''],
    email: ['', [Validators.email]],
    documentType: [''],
    documentNumber: ['', [Validators.minLength(6), Validators.maxLength(11)]],
    phone: ['', [Validators.minLength(10), Validators.maxLength(15)]],
    birthDate: ['', [minimumAgeValidator(18)]],
    state: [''],
    city: [''],
    address: [''],
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

  // =========================
  // PERFIL
  // =========================

  enableEdit() {
    this.isEditing = true;

    const currentUser = this.authService.getUser();

    console.log(currentUser);

    this.profileForm.patchValue({
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      email: currentUser?.email || '',
      documentType: currentUser?.documentType || '',
      documentNumber: currentUser?.documentNumber || '',
      phone: currentUser?.phone || '',
      birthDate: currentUser?.birthDate || '',
      state: currentUser?.state || '',
      city: currentUser?.city || '',
      address: currentUser?.address || '',
    });

    this.selectedDocumentType = currentUser?.documentType || '';
    this.selectedBirthDate = currentUser?.birthDate || '';
  }

  cancelEdit() {
    this.isEditing = false;

    this.profileForm.reset();

    this.submitted = false;
  }

  //   Guardar perfil

  saveProfile() {
    this.submitted = true;

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.authService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: () => {
        const currentUser = this.authService.getUser();

        const updatedUser = {
          ...currentUser,
          ...this.profileForm.getRawValue(),
        };

        localStorage.setItem('user', JSON.stringify(updatedUser));

        this.selectedDocumentType = updatedUser.documentType || '';
        this.selectedBirthDate = updatedUser.birthDate || '';

        this.isEditing = false;
      },

      error: (err) => {
        console.error(err);
      },
    });
  }

  // =========================
  // DOCUMENT TYPE
  // =========================

  toggleDocumentDropdown(event: Event): void {
    event.stopPropagation();

    this.documentDropdownOpen = !this.documentDropdownOpen;
  }

  selectDocumentType(option: string): void {
    this.selectedDocumentType = option;

    this.f.documentType.setValue(option);

    this.documentDropdownOpen = false;
  }

  //   Calendario
  onDateSelected(date: string) {
    this.selectedBirthDate = date;

    this.profileForm.patchValue({
      birthDate: date,
    });

    this.f.birthDate.markAsTouched();
    this.birthCalendarOpen = false;
  }

  toggleBirthCalendar(event: Event) {
    event.stopPropagation();

    this.birthCalendarOpen = !this.birthCalendarOpen;
  }

  // =========================
  // CLOSE DROPDOWNS
  // =========================

  @HostListener('document:click')
  closeDropdowns(): void {
    this.documentDropdownOpen = false;
    this.birthCalendarOpen = false;
  }
}
