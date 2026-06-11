import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUserRoleModalComponent } from './edit-user-role-modal.component';

describe('EditUserRoleModalComponent', () => {
  let component: EditUserRoleModalComponent;
  let fixture: ComponentFixture<EditUserRoleModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditUserRoleModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditUserRoleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
