import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { InfoMedicaComponent } from './medical-info.component';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { AuthService } from '../../../../../../core/services/auth.service';

describe('InfoMedicaComponent', () => {
  let component: InfoMedicaComponent;
  let fixture: ComponentFixture<InfoMedicaComponent>;

  beforeEach(async () => {
    const operacionesSpy = jasmine.createSpyObj('OperacionesService', [
      'getViajes', 'getPaqueteTituloMap', 'getInformacionMedica',
      'registrarInformacionMedica', 'actualizarInformacionMedica', 'eliminarInformacionMedica',
      'getContactos', 'registrarContacto', 'actualizarContacto', 'eliminarContacto',
    ]);
    operacionesSpy.getViajes.and.returnValue(of([]));

    const authSpy = jasmine.createSpyObj('AuthService', ['getAllUsers']);
    authSpy.getAllUsers.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [InfoMedicaComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: OperacionesService, useValue: operacionesSpy },
        { provide: AuthService,        useValue: authSpy },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoMedicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
