import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleViajeComponent } from './detalle-viaje.component';

describe('DetalleViajeComponent', () => {
	let component: DetalleViajeComponent;
	let fixture: ComponentFixture<DetalleViajeComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [DetalleViajeComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(DetalleViajeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
