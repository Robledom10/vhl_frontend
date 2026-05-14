import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageDetailSheetComponent } from './package-detail-sheet.component';

describe('PackageDetailSheetComponent', () => {
  let component: PackageDetailSheetComponent;
  let fixture: ComponentFixture<PackageDetailSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PackageDetailSheetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PackageDetailSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
