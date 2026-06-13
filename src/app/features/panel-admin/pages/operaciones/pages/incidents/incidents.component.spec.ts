import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { IncidentesComponent } from './incidents.component';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';

describe('IncidentesComponent', () => {
  let component: IncidentesComponent;
  let fixture: ComponentFixture<IncidentesComponent>;

  beforeEach(async () => {
    const operacionesSpy = jasmine.createSpyObj('OperacionesService', [
      'getViajes', 'getPaqueteTituloMap', 'getIncidentes',
      'registrarIncidente', 'actualizarIncidente', 'actualizarEstadoIncidente', 'eliminarIncidente',
    ]);
    operacionesSpy.getViajes.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [IncidentesComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: OperacionesService, useValue: operacionesSpy },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncidentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
