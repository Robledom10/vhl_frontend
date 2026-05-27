import {
  Component,
  HostListener,
  EventEmitter,
  Output,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-custom-calendar',
  templateUrl: './custom-calendar.component.html',
  styleUrl: './custom-calendar.component.css',
})
export class CustomCalendarComponent implements OnChanges {
  @Output() dateSelected = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  @Input() isOpen = false;

  @Input() selectedDate: string = '';

  @Input() disablePastDates = false;

  @Input() disableFutureDates = false;

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

  constructor() {
    const current = new Date().getFullYear();

    for (let y = current; y >= 1950; y--) {
      this.yearRange.push(y);
    }
  }

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

  isPastDate(day: number | null): boolean {
    if (!day) return false;

    const date = new Date(this.currentYear, this.currentMonth, day);

    // quitar horas
    date.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return date < today;
  }

  selectBirthDate(day: number | null) {
    if (
      !day ||
      (this.disablePastDates && this.isPastDate(day)) ||
      (this.disableFutureDates && this.isFutureDate(day))
    ) {
      return;
    }

    const date = new Date(this.currentYear, this.currentMonth, day);

    this.selectedBirthDate = `${day}/${this.currentMonth + 1}/${this.currentYear}`;

    this.dateSelected.emit(date.toISOString().split('T')[0]);

    this.closed.emit();
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedDate'] && this.selectedDate) {
      const date = new Date(this.selectedDate);

      this.currentMonth = date.getMonth();

      this.currentYear = date.getFullYear();

      this.selectedBirthDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }
  }

  @HostListener('document:click')
  closeDropdowns(): void {
    this.showMonthSelector = false;
    this.showYearSelector = false;

    this.closed.emit();
  }
}
