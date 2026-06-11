import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationDetailSheetComponent } from './reservation-detail-sheet.component';

describe('ReservationDetailSheetComponent', () => {
  let component: ReservationDetailSheetComponent;
  let fixture: ComponentFixture<ReservationDetailSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReservationDetailSheetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReservationDetailSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
