import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { AsignarAlojamientoComponent } from './assign-accommodation.component';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { PackageService } from '../../../../../../core/services/package.service';

describe('AsignarAlojamientoComponent', () => {
  let component: AsignarAlojamientoComponent;
  let fixture: ComponentFixture<AsignarAlojamientoComponent>;

  beforeEach(async () => {
    const operacionesSpy = jasmine.createSpyObj('OperacionesService', [
      'getAllPaquetes', 'getViajes', 'getAlojamientos',
      'asignarAlojamiento', 'actualizarAlojamiento', 'eliminarAlojamiento',
    ]);
    operacionesSpy.getAllPaquetes.and.returnValue(of([]));
    operacionesSpy.getViajes.and.returnValue(of([]));

    const authSpy = jasmine.createSpyObj('AuthService', ['getAllUsers', 'getUser']);
    authSpy.getAllUsers.and.returnValue(of([]));
    authSpy.getUser.and.returnValue(null);

    const packageSpy = jasmine.createSpyObj('PackageService', ['getProveedoresByTipo']);
    packageSpy.getProveedoresByTipo.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [AsignarAlojamientoComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: OperacionesService, useValue: operacionesSpy },
        { provide: AuthService,        useValue: authSpy },
        { provide: PackageService,     useValue: packageSpy },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignarAlojamientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
