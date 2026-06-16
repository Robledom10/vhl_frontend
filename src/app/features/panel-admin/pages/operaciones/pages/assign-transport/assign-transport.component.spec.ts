import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { AsignarTransporteComponent } from './assign-transport.component';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { PackageService } from '../../../../../../core/services/package.service';

describe('AsignarTransporteComponent', () => {
  let component: AsignarTransporteComponent;
  let fixture: ComponentFixture<AsignarTransporteComponent>;

  beforeEach(async () => {
    const operacionesSpy = jasmine.createSpyObj('OperacionesService', [
      'getAllPaquetes', 'getViajes', 'getTransportes',
      'asignarTransporte', 'actualizarTransporte', 'eliminarTransporte',
    ]);
    operacionesSpy.getAllPaquetes.and.returnValue(of([]));
    operacionesSpy.getViajes.and.returnValue(of([]));

    const packageSpy = jasmine.createSpyObj('PackageService', ['getProveedoresByTipo']);
    packageSpy.getProveedoresByTipo.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [AsignarTransporteComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: OperacionesService, useValue: operacionesSpy },
        { provide: PackageService,     useValue: packageSpy },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignarTransporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
