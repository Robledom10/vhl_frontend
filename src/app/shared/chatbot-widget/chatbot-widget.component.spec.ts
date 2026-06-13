import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotWidgetComponent } from './chatbot-widget.component';
import { ChatbotService } from '../../core/services/chatbot.service';

describe('ChatbotWidgetComponent', () => {
  let component: ChatbotWidgetComponent;
  let fixture: ComponentFixture<ChatbotWidgetComponent>;

  beforeEach(async () => {
    const chatbotSpy = jasmine.createSpyObj('ChatbotService', ['sendMessage', 'validateDocument']);

    await TestBed.configureTestingModule({
      declarations: [ChatbotWidgetComponent],
      providers: [
        { provide: ChatbotService, useValue: chatbotSpy },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatbotWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
