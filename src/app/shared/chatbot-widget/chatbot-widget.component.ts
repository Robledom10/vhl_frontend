import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewChecked,
} from '@angular/core';
import { ChatbotService, ChatMessage } from '../chatbot/chatbot.service';

@Component({
  selector: 'app-chatbot-widget',
  templateUrl: './chatbot-widget.component.html',
  styleUrls: ['./chatbot-widget.component.css'],
})
export class ChatbotWidgetComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesEnd') private messagesEnd!: ElementRef;

  isOpen = false;
  showBubble = false;
  isLoading = false;
  userInput = '';
  sessionId: string | undefined = undefined;
  selectedFile: File | null = null;
  messages: ChatMessage[] = [];

  private shouldScroll = false;

  constructor(private chatbot: ChatbotService) {}

  ngOnInit(): void {
    this.messages.push({
      role: 'bot',
      content:
        'Hey, soy Sharky 🦈 Tu parcero digital pa\' resolver dudas y guiarte en lo que necesites. ¿Qué quieres saber hoy?',
      timestamp: new Date(),
    });

  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    this.showBubble = false;
    if (this.isOpen) this.shouldScroll = true;
  }

  openChat(): void {
    this.isOpen = true;
    this.showBubble = false;
    this.shouldScroll = true;
  }

  closeChat(): void {
    this.isOpen = false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      input.value = '';
    }
  }

  clearFile(): void {
    this.selectedFile = null;
  }

  private containsBadWords(text: string): boolean {
    const bad = [
      'mierda','hijueputa','gonorrea','malparido','puta','culo','verga','coño',
      'marica','idiota','estupido','imbecil','pendejo','hdp','hp','fck','fuck',
      'shit','damn','ass','bitch',
    ];
    const lower = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    return bad.some(w => lower.includes(w));
  }

  sendMessage(): void {
    const text = this.userInput.trim();
    if (!text && !this.selectedFile) return;
    if (this.isLoading) return;

    // Bloqueo de malas palabras antes de enviar
    if (text && this.containsBadWords(text)) {
      this.pushUser(text);
      this.userInput = '';
      this.pushBot(
        '¡Ey! 😅 Sharky está pa\' ayudarte, pero con buena vibra. ' +
        'Por favor reformula tu mensaje sin groserías y con gusto te respondo. 🦈'
      );
      this.shouldScroll = true;
      return;
    }

    // Si hay archivo, validar documento
    if (this.selectedFile) {
      this.handleDocumentUpload(text);
      return;
    }

    this.pushUser(text);
    this.userInput = '';
    this.isLoading = true;
    this.shouldScroll = true;

    this.chatbot.sendMessage(text, this.sessionId).subscribe({
      next: (res) => {
        this.sessionId = res.session_id;
        this.pushBot(res.reply);
        this.isLoading = false;
        this.shouldScroll = true;
      },
      error: () => {
        this.pushBot('Ups, tuve un problema conectándome. Intenta de nuevo 🙏');
        this.isLoading = false;
        this.shouldScroll = true;
      },
    });
  }

  private handleDocumentUpload(extraText: string): void {
    const file = this.selectedFile!;
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    const userMsg = extraText
      || `Adjunté mi ${isPdf ? 'voucher/PDF' : 'documento'}: ${file.name}`;
    this.pushUser(userMsg);
    this.pushBot(`Recibí tu ${isPdf ? 'PDF' : 'imagen'} 📄 Déjame analizarlo un momento...`);
    this.userInput = '';
    this.selectedFile = null;
    this.isLoading = true;
    this.shouldScroll = true;

    this.chatbot.validateDocument(file).subscribe({
      next: (res) => {
        this.pushBot(res.result, true);
        this.isLoading = false;
        this.shouldScroll = true;
      },
      error: () => {
        this.pushBot(
          '😕 No pude analizar ese documento. Verifica que sea un PDF legible o una imagen clara y vuelve a intentarlo.'
        );
        this.isLoading = false;
        this.shouldScroll = true;
      },
    });
  }

  private pushUser(content: string): void {
    this.messages.push({ role: 'user', content, timestamp: new Date() });
  }

  private pushBot(content: string, isDocument = false): void {
    this.messages.push({ role: 'bot', content, isDocument, timestamp: new Date() });
  }

  private scrollToBottom(): void {
    try {
      this.messagesEnd.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } catch {}
  }
}
