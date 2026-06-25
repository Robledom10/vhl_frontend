import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { DashboardOperativoComponent } from './operations-dashboard.component';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { AuthService } from '../../../../../../core/services/auth.service';

describe('DashboardOperativoComponent', () => {
  let component: DashboardOperativoComponent;
  let fixture: ComponentFixture<DashboardOperativoComponent>;

  beforeEach(async () => {
    const operacionesSpy = jasmine.createSpyObj('OperacionesService', [
      'getAllPaquetes', 'getViajes', 'getDashboard',
      'crearViaje', 'actualizarViaje', 'eliminarViaje',
    ]);
    operacionesSpy.getAllPaquetes.and.returnValue(of([]));
    operacionesSpy.getViajes.and.returnValue(of([]));

    const authSpy = jasmine.createSpyObj('AuthService', ['getUser']);
    authSpy.getUser.and.returnValue(null);

    await TestBed.configureTestingModule({
      declarations: [DashboardOperativoComponent],
      imports: [ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: OperacionesService, useValue: operacionesSpy },
        { provide: AuthService,        useValue: authSpy },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardOperativoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
