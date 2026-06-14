import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

@Component({
	selector: 'app-reservation-wizard',
	templateUrl: './reservation-wizard.component.html',
	styleUrl: './reservation-wizard.component.css'
})
export class ReservationWizardComponent implements OnInit, OnDestroy {

	@Output() closed = new EventEmitter<void>();
	@Input() travelers = 1;

	currentStep = 1;
	private scrollY = 0;

	emergencyContacts = [
		{
			fullName: '',
			relationship: '',
			document: '',
			phone: '',
			alternatePhone: ''
		}
	];

	companions: any[] = [];

	specialRequest = '';

	roomType = '';

	additionalNotes = '';

	acceptTerms = false;

	acceptCancellation = false;

	private blockScroll(): void {

		this.scrollY = window.scrollY;

		document.documentElement.style.overflow = 'hidden';
		document.documentElement.style.position = 'fixed';
		document.documentElement.style.top = `-${this.scrollY}px`;
		document.documentElement.style.width = '100%';

		document.body.style.overflow = 'hidden';
		document.body.style.position = 'fixed';
		document.body.style.top = `-${this.scrollY}px`;
		document.body.style.width = '100%';
	}

	private restoreScroll(): void {

		document.documentElement.style.overflow = '';
		document.documentElement.style.position = '';
		document.documentElement.style.top = '';
		document.documentElement.style.width = '';

		document.body.style.overflow = '';
		document.body.style.position = '';
		document.body.style.top = '';
		document.body.style.width = '';

		window.scrollTo(0, this.scrollY);
	}

	ngOnInit(): void {
		this.blockScroll();

		this.companions = Array.from(
			{ length: Math.max(this.travelers - 1, 0) },
			() => ({
				name: '',
				birthDate: '',
				documentType: '',
				documentNumber: ''
			})
		);
	}

	ngOnDestroy(): void {
		this.restoreScroll();
	}

	close(): void {
		this.closed.emit();
	}

	nextStep(): void {
		if (this.currentStep < 4) {
			this.currentStep++;
		}
	}

	previousStep(): void {
		if (this.currentStep > 1) {
			this.currentStep--;
		}
	}

	// Contactos de emergencia

	addEmergencyContact(): void {
		this.emergencyContacts.push({
			fullName: '',
			relationship: '',
			document: '',
			phone: '',
			alternatePhone: ''
		});
	}

	removeEmergencyContact(index: number): void {
		if (this.emergencyContacts.length > 1) {
			this.emergencyContacts.splice(index, 1);
		}
	}
}