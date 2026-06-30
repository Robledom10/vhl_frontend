import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NextTripBannerComponent } from './next-trip-banner.component';

describe('NextTripBannerComponent', () => {
  let component: NextTripBannerComponent;
  let fixture: ComponentFixture<NextTripBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NextTripBannerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NextTripBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
