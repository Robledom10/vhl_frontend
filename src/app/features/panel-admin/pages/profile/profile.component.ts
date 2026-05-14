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
    'Cedula Extranjeria',
    'Pasaporte',
    'Visa',
  ];

  // =========================
  // CALENDARIO
  // =========================

  birthCalendarOpen = false;

  selectedBirthDate = '';

  showMonthSelector = false;
  showYearSelector = false;

  dayNames = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

  monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  today = new Date();

  currentMonth = this.today.getMonth();

  currentYear = this.today.getFullYear();

  yearRange: number[] = [];

  constructor(
    public authService: AuthService,
    private fb: FormBuilder,
  ) {
    const current = new Date().getFullYear();

    for (let y = current; y >= 1950; y--) {
      this.yearRange.push(y);
    }
  }

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
  // CALENDARIO GETTERS
  // =========================

  get monthName() {
    return this.monthNames[this.currentMonth];
  }

  get calendarDays(): (number | null)[] {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();

    const daysInMonth = new Date(
      this.currentYear,
      this.currentMonth + 1,
      0,
    ).getDate();

    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }

  // =========================
  // PERFIL
  // =========================

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

  // =========================
  // CALENDARIO
  // =========================

  toggleBirthCalendar(event: Event) {
    event.stopPropagation();

    this.birthCalendarOpen = !this.birthCalendarOpen;

    this.showMonthSelector = false;
    this.showYearSelector = false;

    if (!this.birthCalendarOpen) {
      this.f.birthDate.markAsTouched();
    }
  }

  toggleMonthSelector(event: Event) {
    event.stopPropagation();

    this.showMonthSelector = !this.showMonthSelector;
    this.showYearSelector = false;
  }

  toggleYearSelector(event: Event) {
    event.stopPropagation();

    this.showYearSelector = !this.showYearSelector;
    this.showMonthSelector = false;
  }

  selectMonth(month: number) {
    this.currentMonth = month;
    this.showMonthSelector = false;
  }

  selectYear(year: number) {
    this.currentYear = year;
    this.showYearSelector = false;
  }

  prevMonth() {
    if (this.currentYear === 1950 && this.currentMonth === 0) {
      return;
    }

    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
  }

  nextMonth() {
    const next = new Date(this.currentYear, this.currentMonth + 1);

    if (
      next.getFullYear() > this.today.getFullYear() ||
      (next.getFullYear() === this.today.getFullYear() &&
        next.getMonth() > this.today.getMonth())
    ) {
      return;
    }

    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
  }

  isFutureDate(day: number | null): boolean {
    if (!day) return false;

    const date = new Date(this.currentYear, this.currentMonth, day);

    return date > this.today;
  }

  selectBirthDate(day: number | null) {
    if (!day || this.isFutureDate(day)) return;

    const date = new Date(this.currentYear, this.currentMonth, day);

    const formatted = `${day}/${this.currentMonth + 1}/${this.currentYear}`;

    this.selectedBirthDate = formatted;

    this.profileForm.patchValue({
      birthDate: date.toISOString().split('T')[0],
    });

    this.f.birthDate.markAsTouched();

    this.birthCalendarOpen = false;
  }

  isBirthSelected(day: number | null): boolean {
    if (!day || !this.selectedBirthDate) return false;

    return (
      this.selectedBirthDate ===
      `${day}/${this.currentMonth + 1}/${this.currentYear}`
    );
  }

  isToday(day: number | null): boolean {
    if (!day) return false;

    return (
      day === this.today.getDate() &&
      this.currentMonth === this.today.getMonth() &&
      this.currentYear === this.today.getFullYear()
    );
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

  // =========================
  // CLOSE DROPDOWNS
  // =========================

  @HostListener('document:click')
  closeDropdowns(): void {
    this.documentDropdownOpen = false;
    this.birthCalendarOpen = false;
    this.showMonthSelector = false;
    this.showYearSelector = false;
  }
}
