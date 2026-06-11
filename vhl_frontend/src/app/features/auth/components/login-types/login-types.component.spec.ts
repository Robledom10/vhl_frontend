import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginTypesComponent } from './login-types.component';

describe('LoginTypesComponent', () => {
  let component: LoginTypesComponent;
  let fixture: ComponentFixture<LoginTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginTypesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoginTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
