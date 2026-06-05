import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelOperationComponent } from './travel-operation.component';

describe('TravelOperationComponent', () => {
  let component: TravelOperationComponent;
  let fixture: ComponentFixture<TravelOperationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TravelOperationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TravelOperationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
