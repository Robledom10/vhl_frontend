import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { FormReservationsCreationComponent } from './form-reservations-creation.component';
import { ReservationService } from '../../../../../../core/services/reservation.service';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';

describe('FormReservationsCreationComponent', () => {
  let component: FormReservationsCreationComponent;
  let fixture: ComponentFixture<FormReservationsCreationComponent>;

  beforeEach(async () => {
    const reservationSpy = jasmine.createSpyObj('ReservationService', ['crear']);

    const operacionesSpy = jasmine.createSpyObj('OperacionesService', ['getViajes', 'getPaquete']);
    operacionesSpy.getViajes.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [FormReservationsCreationComponent],
      imports: [FormsModule, NoopAnimationsModule],
      providers: [
        { provide: ReservationService,  useValue: reservationSpy },
        { provide: OperacionesService,  useValue: operacionesSpy },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormReservationsCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
