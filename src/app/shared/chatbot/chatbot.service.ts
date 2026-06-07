import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  isDocument?: boolean;
  timestamp: Date;
}

export interface ChatApiResponse {
  session_id: string;
  model: string;
  reply: string;
}

export interface DocumentValidationResponse {
  model: string;
  document_type: string;
  result: string;
}

const SYSTEM_PROMPT =
  'Eres Sharky 🦈, el asistente virtual oficial de Hernando Lopera Viajes. ' +
  'Reglas que SIEMPRE debes seguir:\n' +
  '1. Saluda con calidez y entusiasmo cuando el usuario diga hola, buenos días, buenas tardes, etc.\n' +
  '2. Usa un español colombiano amigable e informal pero respetuoso.\n' +
  '3. Si el usuario usa groserías, malas palabras o lenguaje inapropiado, ' +
  'responde amablemente que no puedes continuar con ese lenguaje y pide que reformule su mensaje.\n' +
  '4. Ayuda con: excursiones, destinos, vouchers, reservas, precios, itinerarios y servicios de la empresa.\n' +
  '5. Cuando el usuario suba un documento, analízalo e indica claramente si es válido o no.\n' +
  '6. Sé conciso: máximo 3 párrafos por respuesta.\n' +
  '7. Termina siempre de forma positiva, ofreciendo más ayuda.';

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private readonly base = environment.chatbotUrl;

  constructor(private http: HttpClient) {}

  sendMessage(message: string, sessionId?: string): Observable<ChatApiResponse> {
    return this.http.post<ChatApiResponse>(`${this.base}/chat`, {
      message,
      session_id: sessionId ?? null,
      system: SYSTEM_PROMPT,
    });
  }

  validateDocument(file: File): Observable<DocumentValidationResponse> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<DocumentValidationResponse>(`${this.base}/validate-document`, form);
  }
}
