import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
import { minimumAgeValidator } from '../../../../core/validators/custom.validators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})

export class ProfileComponent implements OnInit {
  // Calendario
  birthCalendarOpen = false;
  selectedBirthDate = '';

  // Funcionamiento del form
  isEditing = false;
  submitted = false;

  ngOnInit(): void {
    this.loadProfile();
  }

  constructor(
    public authService: AuthService,
    private fb: FormBuilder,
  ) {}

  profileForm = this.fb.group({
    firstName: ['', [Validators.minLength(3)]],
    lastName: [''],
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

  loadProfile() {
    this.authService.getProfile().subscribe({
      next: (user: any) => {
        localStorage.setItem('user', JSON.stringify(user));

        this.profileForm.patchValue({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone || '',
          birthDate: user.birthDate || '',
          state: user.state || '',
          city: user.city || '',
          address: user.address || '',
        });

        this.selectedBirthDate = user.birthDate || '';
      },

      error: (err) => {
        console.error(err);
      },
    });
  }

  enableEdit() {
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;

    this.profileForm.reset();

    this.submitted = false;
  }

  // =========================
  // GUARDAR PERFIL
  // =========================

  saveProfile() {
    this.submitted = true;

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.authService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: (updatedUser: any) => {
        localStorage.setItem('user', JSON.stringify(updatedUser));

        this.selectedBirthDate = updatedUser.birthDate || '';

        this.isEditing = false;
      },

      error: (err) => {
        console.error(err);
      },
    });
  }

  // =========================
  // CALENDARIO
  // =========================

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
    this.birthCalendarOpen = false;
  }
}