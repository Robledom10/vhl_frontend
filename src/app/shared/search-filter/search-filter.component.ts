import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrl:'./search-filter.component.css',
})
export class SearchFilterComponent {
  calendarOpen: string | null = null;
  fechaSalida: string = '';
  fechaLlegada: string = '';

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
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }

  toggleCalendar(type: string, event: Event) {
    event.stopPropagation();
    this.calendarOpen = this.calendarOpen === type ? null : type;
  }

  selectDate(day: number | null, type: string) {
    if (!day) return;
    const date = `${day}/${this.currentMonth + 1}/${this.currentYear}`;
    if (type === 'salida') this.fechaSalida = date;
    if (type === 'llegada') this.fechaLlegada = date;
    this.calendarOpen = null;
  }

  isSelected(day: number | null, type: string): boolean {
    if (!day) return false;
    const date = `${day}/${this.currentMonth + 1}/${this.currentYear}`;
    return type === 'salida'
      ? this.fechaSalida === date
      : this.fechaLlegada === date;
  }

  isToday(day: number | null): boolean {
    if (!day) return false;
    return (
      day === this.today.getDate() &&
      this.currentMonth === this.today.getMonth() &&
      this.currentYear === this.today.getFullYear()
    );
  }

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
  }

  @HostListener('document:click')
  onClickOutside() {
    this.calendarOpen = null;
  }
  yearRange: number[] = [];

  constructor() {
    const current = new Date().getFullYear();
    for (let y = current; y <= current + 5; y++) {
      this.yearRange.push(y);
    }
  }

  changeMonth(event: Event) {
    this.currentMonth = +(event.target as HTMLSelectElement).value;
  }

  changeYear(event: Event) {
    this.currentYear = +(event.target as HTMLSelectElement).value;
  }
}
