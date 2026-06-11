import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarPanelAdminComponent } from './navbar-panel-admin.component';

describe('NavbarPanelAdminComponent', () => {
  let component: NavbarPanelAdminComponent;
  let fixture: ComponentFixture<NavbarPanelAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavbarPanelAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NavbarPanelAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
