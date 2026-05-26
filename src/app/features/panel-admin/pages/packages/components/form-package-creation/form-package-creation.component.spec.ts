import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormPackageCreationComponent } from './form-package-creation.component';

describe('FormPackageCreationComponent', () => {
  let component: FormPackageCreationComponent;
  let fixture: ComponentFixture<FormPackageCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormPackageCreationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormPackageCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
