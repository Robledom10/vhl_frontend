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

		for (let y = current + 10; y >= 1950; y--) {
			this.yearRange.push(y);
		}
	}

	// =========================================================
	// GETTERS
	// =========================================================

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

	// =========================================================
	// PARSE DATE
	// =========================================================

	parseDate(dateString: string): Date {
		const [year, month, day] = dateString.split('-').map(Number);

		return new Date(year, month - 1, day);
	}

	// =========================================================
	// SELECTORS
	// =========================================================

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

	// =========================================================
	// MONTH NAVIGATION
	// =========================================================

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

	// =========================================================
	// VALIDATIONS
	// =========================================================

	isFutureDate(day: number | null): boolean {
		if (!day) return false;

		const date = new Date(this.currentYear, this.currentMonth, day);

		date.setHours(0, 0, 0, 0);

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		return date > today;
	}

	isPastDate(day: number | null): boolean {
		if (!day) return false;

		const date = new Date(this.currentYear, this.currentMonth, day);

		date.setHours(0, 0, 0, 0);

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		return date < today;
	}

	// =========================================================
	// SELECT DATE
	// =========================================================

	selectBirthDate(day: number | null) {
		if (!day) return;

		if (this.disablePastDates && this.isPastDate(day)) return;

		if (this.disableFutureDates && this.isFutureDate(day)) return;

		const date = new Date(this.currentYear, this.currentMonth, day);

		// FORMATO VISUAL
		this.selectedBirthDate = `${day}/${this.currentMonth + 1}/${this.currentYear}`;

		// FORMATO YYYY-MM-DD
		const formattedDate = [
			date.getFullYear(),
			String(date.getMonth() + 1).padStart(2, '0'),
			String(date.getDate()).padStart(2, '0'),
		].join('-');

		this.dateSelected.emit(formattedDate);

		this.closed.emit();
	}

	// =========================================================
	// STATES
	// =========================================================

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

	// =========================================================
	// CHANGES
	// =========================================================

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['selectedDate'] && this.selectedDate) {
			const date = this.parseDate(this.selectedDate);

			this.currentMonth = date.getMonth();
			this.currentYear = date.getFullYear();

			this.selectedBirthDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
		}

		// CUANDO SE ABRE EL CALENDARIO
		if (changes['isOpen'] && this.isOpen && this.selectedDate) {
			const date = this.parseDate(this.selectedDate);

			this.currentMonth = date.getMonth();
			this.currentYear = date.getFullYear();
		}
	}

	// =========================================================
	// CLOSE
	// =========================================================

	@HostListener('document:click', ['$event'])
	closeDropdowns(event: Event): void {
		const target = event.target as HTMLElement;

		if (!target.closest('.calendar-dropdown')) {
			this.showMonthSelector = false;
			this.showYearSelector = false;

			this.closed.emit();
		}
	}
}
