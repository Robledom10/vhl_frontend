import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackagesCardComponent } from './packages-card.component';

describe('PackagesCardComponent', () => {
  let component: PackagesCardComponent;
  let fixture: ComponentFixture<PackagesCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PackagesCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PackagesCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
