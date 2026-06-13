import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { AsignarRestauranteComponent } from './assign-restaurant.component';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { PackageService } from '../../../../../../core/services/package.service';

describe('AsignarRestauranteComponent', () => {
  let component: AsignarRestauranteComponent;
  let fixture: ComponentFixture<AsignarRestauranteComponent>;

  beforeEach(async () => {
    const operacionesSpy = jasmine.createSpyObj('OperacionesService', [
      'getAllPaquetes', 'getViajes', 'getRestaurantes',
      'asignarRestaurante', 'actualizarRestaurante', 'eliminarRestaurante',
    ]);
    operacionesSpy.getAllPaquetes.and.returnValue(of([]));
    operacionesSpy.getViajes.and.returnValue(of([]));

    const packageSpy = jasmine.createSpyObj('PackageService', ['getProveedoresByTipo']);
    packageSpy.getProveedoresByTipo.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [AsignarRestauranteComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: OperacionesService, useValue: operacionesSpy },
        { provide: PackageService,     useValue: packageSpy },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignarRestauranteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
