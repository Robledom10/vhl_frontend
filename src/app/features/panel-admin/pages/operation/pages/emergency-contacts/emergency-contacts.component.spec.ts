import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { ContactosEmergenciaComponent } from './emergency-contacts.component';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { AuthService } from '../../../../../../core/services/auth.service';

describe('ContactosEmergenciaComponent', () => {
	let component: ContactosEmergenciaComponent;
	let fixture: ComponentFixture<ContactosEmergenciaComponent>;

	beforeEach(async () => {
		const operacionesSpy = jasmine.createSpyObj('OperacionesService', [
			'getViajes', 'getPaqueteTituloMap', 'getContactos',
			'registrarContacto', 'actualizarContacto', 'eliminarContacto',
		]);
		operacionesSpy.getViajes.and.returnValue(of([]));

		const authSpy = jasmine.createSpyObj('AuthService', ['getAllUsers']);
		authSpy.getAllUsers.and.returnValue(of([]));

		await TestBed.configureTestingModule({
			declarations: [ContactosEmergenciaComponent],
			imports: [ReactiveFormsModule],
			providers: [
				{ provide: OperacionesService, useValue: operacionesSpy },
				{ provide: AuthService, useValue: authSpy },
			],
		})
			.compileComponents();

		fixture = TestBed.createComponent(ContactosEmergenciaComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
