import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormReservationsCreationComponent } from './form-reservations-creation.component';

describe('FormReservationsCreationComponent', () => {
  let component: FormReservationsCreationComponent;
  let fixture: ComponentFixture<FormReservationsCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormReservationsCreationComponent]
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
