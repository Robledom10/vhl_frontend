import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterGalleryComponent } from './filter-gallery.component';

describe('FilterGalleryComponent', () => {
  let component: FilterGalleryComponent;
  let fixture: ComponentFixture<FilterGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilterGalleryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FilterGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
