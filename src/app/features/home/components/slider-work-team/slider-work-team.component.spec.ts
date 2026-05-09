import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderWorkTeamComponent } from './slider-work-team.component';

describe('SliderWorkTeamComponent', () => {
  let component: SliderWorkTeamComponent;
  let fixture: ComponentFixture<SliderWorkTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SliderWorkTeamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SliderWorkTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
