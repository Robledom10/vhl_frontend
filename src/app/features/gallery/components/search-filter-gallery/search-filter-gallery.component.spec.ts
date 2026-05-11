import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFilterGalleryComponent } from './search-filter-gallery.component';

describe('SearchFilterGalleryComponent', () => {
  let component: SearchFilterGalleryComponent;
  let fixture: ComponentFixture<SearchFilterGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchFilterGalleryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchFilterGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
