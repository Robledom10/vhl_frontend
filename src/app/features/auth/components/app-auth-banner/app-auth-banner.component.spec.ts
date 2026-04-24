import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppAuthBannerComponent } from './app-auth-banner.component';

describe('AppAuthBannerComponent', () => {
  let component: AppAuthBannerComponent;
  let fixture: ComponentFixture<AppAuthBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppAuthBannerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppAuthBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
