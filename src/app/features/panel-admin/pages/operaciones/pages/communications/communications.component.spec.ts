import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { ComunicacionesComponent } from './communications.component';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';

describe('ComunicacionesComponent', () => {
  let component: ComunicacionesComponent;
  let fixture: ComponentFixture<ComunicacionesComponent>;

  beforeEach(async () => {
    const operacionesSpy = jasmine.createSpyObj('OperacionesService', [
      'getViajes', 'getPaqueteTituloMap', 'getNotificaciones',
      'enviarNotificacion', 'actualizarNotificacion', 'eliminarNotificacion',
    ]);
    operacionesSpy.getViajes.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [ComunicacionesComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: OperacionesService, useValue: operacionesSpy },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComunicacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
