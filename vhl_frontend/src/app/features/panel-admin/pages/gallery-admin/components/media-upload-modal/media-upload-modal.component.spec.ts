import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaUploadModalComponent } from './media-upload-modal.component';

describe('MediaUploadModalComponent', () => {
  let component: MediaUploadModalComponent;
  let fixture: ComponentFixture<MediaUploadModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MediaUploadModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MediaUploadModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
