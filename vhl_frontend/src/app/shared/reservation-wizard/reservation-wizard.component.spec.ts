import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationWizardComponent } from './reservation-wizard.component';

describe('ReservationWizardComponent', () => {
	let component: ReservationWizardComponent;
	let fixture: ComponentFixture<ReservationWizardComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ReservationWizardComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(ReservationWizardComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
