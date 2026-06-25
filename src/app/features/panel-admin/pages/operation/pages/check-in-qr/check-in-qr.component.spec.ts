import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CheckInQrComponent } from './check-in-qr.component';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';

describe('CheckInQrComponent', () => {
  let component: CheckInQrComponent;
  let fixture: ComponentFixture<CheckInQrComponent>;

  beforeEach(async () => {
    const operacionesSpy = jasmine.createSpyObj('OperacionesService', [
      'getViajes', 'getPaqueteTituloMap', 'getReservasPorPaquete',
      'getCheckIns', 'registrarCheckIn',
    ]);
    operacionesSpy.getViajes.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [CheckInQrComponent],
      providers: [
        { provide: OperacionesService, useValue: operacionesSpy },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckInQrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
