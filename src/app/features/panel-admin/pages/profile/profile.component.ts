import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
import { minimumAgeValidator } from '../../../../core/validators/custom.validators';
import colombiaData from '../../../../../assets/data/colombia.json';

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

  // Modal de confirmación

  showConfirmModal = false;

  //  Dropdowns de departamento y ciudad

  departmentDropdownOpen = false;
  cityDropdownOpen = false;

  selectedDepartment = '';
  selectedCity = '';

  departments: string[] = [];

  cities: string[] = [];

  ngOnInit(): void {
    this.loadProfile();

    this.departments = colombiaData.colombia.map((item) => item.departamento);
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

        // Departamento
        this.selectedDepartment = user.state || '';

        // Cargar ciudades del departamento
        const foundDepartment = colombiaData.colombia.find(
          (item) => item.departamento === this.selectedDepartment,
        );

        this.cities = foundDepartment?.municipios || [];

        // Ciudad
        this.selectedCity = user.city || '';
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

    this.loadProfile();

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

    this.showConfirmModal = true;
  }

  confirmSaveProfile() {
    this.authService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: (updatedUser: any) => {
        localStorage.setItem('user', JSON.stringify(updatedUser));

        this.selectedBirthDate = updatedUser.birthDate || '';

        this.isEditing = false;

        this.showConfirmModal = false;
      },

      error: (err) => {
        console.error(err);

        this.showConfirmModal = false;
      },
    });
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
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

  //   Para cambiar de departamento y cargar las ciudades correspondientes
  onDepartmentChange(department: string): void {
    const foundDepartment = colombiaData.colombia.find(
      (item) => item.departamento === department,
    );

    this.cities = foundDepartment?.municipios || [];
  }

  toggleDepartmentDropdown(event: Event) {
    event.stopPropagation();

    this.departmentDropdownOpen = !this.departmentDropdownOpen;

    this.cityDropdownOpen = false;
  }

  selectDepartment(department: string) {
    this.selectedDepartment = department;

    this.profileForm.patchValue({
      state: department,
      city: '',
    });

    this.selectedCity = '';

    this.onDepartmentChange(department);

    this.f.state.markAsTouched();

    this.departmentDropdownOpen = false;
  }

  toggleCityDropdown(event: Event) {
    event.stopPropagation();

    if (!this.selectedDepartment) return;

    this.cityDropdownOpen = !this.cityDropdownOpen;

    this.departmentDropdownOpen = false;
  }

  selectCity(city: string) {
    this.selectedCity = city;

    this.profileForm.patchValue({
      city,
    });

    this.f.city.markAsTouched();

    this.cityDropdownOpen = false;
  }

  // =========================
  // CLOSE DROPDOWNS
  // =========================

  @HostListener('document:click')
  closeDropdowns(): void {
    this.birthCalendarOpen = false;

    this.departmentDropdownOpen = false;

    this.cityDropdownOpen = false;
  }
}
