import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditViajeFormComponent } from './edit-viaje-form.component';

describe('EditViajeFormComponent', () => {
	let component: EditViajeFormComponent;
	let fixture: ComponentFixture<EditViajeFormComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [EditViajeFormComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(EditViajeFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
