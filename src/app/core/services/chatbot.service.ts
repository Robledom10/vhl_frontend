import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TravelPackage } from '../../shared/utils/package-mapper';

export type VoucherEstado = 'puede_viajar' | 'pendiente' | 'no_puede_viajar' | 'desconocido';

export interface QuickReply {
	label: string;
	action: 'message' | 'upload' | 'show_packages' | 'faq_menu' | 'faq_answer' | 'support' | 'menu';
	payload?: string;
}

export interface ChatMessage {
	role: 'user' | 'bot';
	content: string;
	isDocument?: boolean;
	docEstado?: VoucherEstado;
	quickReplies?: QuickReply[];
	/** Vista previa del archivo adjunto (solo en mensajes del usuario que subieron un documento) */
	fileUrl?: string;
	fileName?: string;
	fileKind?: 'image' | 'pdf';
	/** Carrusel de paquetes reales (catálogo real con foto/precio) mostrado por Sharky */
	packages?: TravelPackage[];
	/** Solo true en respuestas reales de la IA — ahí mostramos 👍/👎 */
	showFeedback?: boolean;
	feedback?: 'up' | 'down';
	/** Pregunta del usuario que esta respuesta contesta (para mandarla junto al feedback) */
	userMessage?: string;
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
	estado: VoucherEstado;
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {
	private readonly base = environment.chatbotUrl;

	constructor(private http: HttpClient) { }

	sendMessage(message: string, sessionId?: string): Observable<ChatApiResponse> {
		// No mandamos "system" propio: el backend ya define el prompt (con catálogo de paquetes
		// en vivo y variación de tono) y lo mantiene actualizado sin tocar el frontend.
		return this.http.post<ChatApiResponse>(`${this.base}/chat`, {
			message,
			session_id: sessionId ?? null,
		});
	}

	validateDocument(file: File): Observable<DocumentValidationResponse> {
		const form = new FormData();
		form.append('file', file);
		return this.http.post<DocumentValidationResponse>(`${this.base}/validate-document`, form);
	}

	sendFeedback(rating: 'up' | 'down', userMessage: string, botReply: string, sessionId?: string): Observable<{ status: string }> {
		return this.http.post<{ status: string }>(`${this.base}/feedback`, {
			session_id: sessionId ?? null,
			user_message: userMessage,
			bot_reply: botReply,
			rating,
		});
	}
}
