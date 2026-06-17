import { Component, ElementRef, OnInit, OnDestroy, ViewChild, AfterViewChecked } from '@angular/core';
import { ChatbotService, ChatMessage, QuickReply } from '../../core/services/chatbot.service';
import { PackageService } from '../../core/services/package.service';
import { RespuestaPaqueteTuristico } from '../../features/panel-admin/models/package.model';
import { PackageDetail } from '../package-detail-sheet/package-detail-sheet.component';
import { TravelPackage, mapToTravelPackage, mapToPackageDetail, mapToPackageDetailFallback } from '../utils/package-mapper';

const QUICK_REPLIES: QuickReply[] = [
	{ label: '📦 Ver paquetes y precios', action: 'show_packages' },
	{ label: '🧳 ¿Cómo reservo?', action: 'message', payload: '¿Cómo puedo reservar un paquete paso a paso?' },
	{ label: '📄 Validar mi voucher', action: 'upload' },
	{ label: '💳 ¿Cómo pago?', action: 'message', payload: '¿Cómo funcionan los pagos en la plataforma?' },
	{ label: '❓ Preguntas frecuentes', action: 'faq_menu' },
];

const SUPPORT_CHIP: QuickReply = { label: '🆘 Hablar con soporte', action: 'support' };

interface FaqItem {
	id: string;
	question: string;
	answer: string;
}

// Respuestas fijas, sin pasar por la IA — cero carga al modelo y siempre consistentes.
const FAQ_ITEMS: FaqItem[] = [
	{
		id: 'cancelar',
		question: '¿Cómo cancelo mi reserva?',
		answer:
			'Puedes cancelar desde tu perfil > "Mis Reservas". En general aplica: cancelación gratuita hasta 5 días antes ' +
			'del viaje, 50% de reembolso si cancelas con 48 horas de anticipación, y no hay devolución el mismo día del viaje. ' +
			'Revisa la política específica de tu paquete porque puede variar un poco.',
	},
	{
		id: 'pago-tarde',
		question: '¿Qué pasa si no pago a tiempo?',
		answer:
			'Si no completas el pago antes de la fecha límite de tu reserva, el cupo se libera y deberás reservar de nuevo ' +
			'sujeto a disponibilidad. Te recomendamos pagar por Wompi lo antes posible para asegurar tu lugar.',
	},
	{
		id: 'menor-edad',
		question: '¿Puedo viajar con un menor de edad?',
		answer:
			'Sí, pero el menor debe viajar con un permiso firmado por sus padres o tutores legales y cumplir la edad ' +
			'mínima del paquete. Revisa los requisitos específicos de cada paquete antes de reservar — puedes preguntarme ' +
			'por los requisitos de un paquete puntual.',
	},
	{
		id: 'cambiar-reserva',
		question: '¿Cómo cambio mi reserva?',
		answer:
			'Los cambios de fecha o de paquete se gestionan contactando a soporte (604-123-4567) o desde el detalle de tu ' +
			'reserva en "Mis Reservas". Cuéntame qué necesitas cambiar y te oriento.',
	},
];

@Component({
	selector: 'app-chatbot-widget',
	templateUrl: './chatbot-widget.component.html',
	styleUrls: ['./chatbot-widget.component.css'],
})
export class ChatbotWidgetComponent implements OnInit, OnDestroy, AfterViewChecked {
	@ViewChild('messagesEnd') private messagesEnd!: ElementRef;
	@ViewChild('fileInput') private fileInputRef!: ElementRef<HTMLInputElement>;

	isOpen = false;
	showBubble = false;
	isLoading = false;
	userInput = '';
	sessionId: string | undefined = undefined;
	selectedFile: File | null = null;
	messages: ChatMessage[] = [];

	// Bottom sheet de detalle de paquete (el mismo que usa la página de Paquetes)
	sheetOpen = false;
	selectedPackageDetail: PackageDetail | null = null;

	private shouldScroll = false;
	private objectUrls: string[] = [];
	private cachedApiPackages: RespuestaPaqueteTuristico[] = [];

	constructor(private chatbot: ChatbotService, private packageService: PackageService) { }

	ngOnInit(): void {
		this.messages.push({
			role: 'bot',
			content:
				'Hey, soy Sharky 🦈 Tu parcero digital pa\' resolver dudas y guiarte en lo que necesites. ¿Qué quieres saber hoy?',
			quickReplies: QUICK_REPLIES,
			timestamp: new Date(),
		});

	}

	/** El usuario tocó una de las opciones de respuesta rápida. */
	onQuickReply(msg: ChatMessage, option: QuickReply): void {
		msg.quickReplies = undefined;
		if (option.action === 'upload') {
			this.fileInputRef.nativeElement.click();
			return;
		}
		if (option.action === 'show_packages') {
			this.showPackages(option.label);
			return;
		}
		if (option.action === 'faq_menu') {
			this.showFaqMenu();
			return;
		}
		if (option.action === 'faq_answer') {
			this.showFaqAnswer(option.payload ?? '');
			return;
		}
		if (option.action === 'menu') {
			this.pushBot('¿En qué más te puedo ayudar? 🦈', false, undefined, undefined, QUICK_REPLIES);
			this.shouldScroll = true;
			return;
		}
		if (option.action === 'support') {
			this.pushBot(
				'Para hablar con soporte comunícate al 604-123-4567 o contáctanos desde la plataforma. ¡Estamos pa\' lo que necesites! 🦈',
				false, undefined, undefined,
				[{ label: '← Volver al menú', action: 'menu' }]
			);
			this.shouldScroll = true;
			return;
		}
		this.userInput = option.payload ?? '';
		this.sendMessage();
	}

	private showFaqMenu(): void {
		const faqReplies: QuickReply[] = FAQ_ITEMS.map(item => ({
			label: item.question,
			action: 'faq_answer' as const,
			payload: item.id,
		}));
		faqReplies.push({ label: '← Volver al menú', action: 'menu' });
		this.pushBot('¿Sobre qué tenés dudas? Elegí la pregunta 🦈', false, undefined, undefined, faqReplies);
		this.shouldScroll = true;
	}

	private showFaqAnswer(id: string): void {
		const item = FAQ_ITEMS.find(f => f.id === id);
		if (!item) return;
		this.pushUser(item.question);
		this.pushBot(item.answer, false, undefined, undefined, [
			{ label: '❓ Otras preguntas frecuentes', action: 'faq_menu' },
			SUPPORT_CHIP,
		]);
		this.shouldScroll = true;
	}

	/** Muestra el catálogo real (fotos y precios reales) como tarjetas dentro del chat. */
	private showPackages(label: string): void {
		this.pushUser(label);
		this.isLoading = true;
		this.shouldScroll = true;

		this.packageService.getPackages({ activo: true, tamano: 12 }).subscribe({
			next: (page) => {
				this.cachedApiPackages = page.content;
				const packages = page.content.map(mapToTravelPackage);
				this.isLoading = false;
				if (packages.length === 0) {
					this.pushBot('Por ahora no tenemos paquetes activos publicados, pero pronto subimos novedades 🦈');
				} else {
					this.pushBot('¡Estos son nuestros paquetes disponibles! 🦈 Tócalos para ver todo el detalle.', false, undefined, packages);
				}
				this.shouldScroll = true;
			},
			error: () => {
				this.isLoading = false;
				this.pushBot('Ups, no pude traer el catálogo de paquetes. Intenta de nuevo en un momento 🙏');
				this.shouldScroll = true;
			},
		});
	}

	/** Abre el mismo bottom sheet de detalle/reserva que usa la página pública de Paquetes. */
	openPackageDetail(pkg: TravelPackage): void {
		const api = this.cachedApiPackages.find((p) => p.id === pkg.id);
		this.selectedPackageDetail = api ? mapToPackageDetail(api) : mapToPackageDetailFallback(pkg);
		this.sheetOpen = true;
	}

	closePackageDetail(): void {
		this.sheetOpen = false;
	}

	onPkgImgError(event: Event): void {
		const img = event.target as HTMLImageElement;
		img.src = 'https://placehold.co/300x160/3fa2db/white?text=VHL';
		img.onerror = null;
	}

	ngAfterViewChecked(): void {
		if (this.shouldScroll) {
			this.scrollToBottom();
			this.shouldScroll = false;
		}
	}

	ngOnDestroy(): void {
		this.objectUrls.forEach(url => URL.revokeObjectURL(url));
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

	/** Abre la imagen adjunta en una pestaña nueva para verla en tamaño completo. */
	openAttachment(fileUrl?: string): void {
		if (fileUrl) window.open(fileUrl, '_blank');
	}

	private containsBadWords(text: string): boolean {
		const bad = [
			'mierda', 'hijueputa', 'gonorrea', 'malparido', 'puta', 'culo', 'verga', 'coño',
			'marica', 'idiota', 'estupido', 'imbecil', 'pendejo', 'hdp', 'hp', 'fck', 'fuck',
			'shit', 'damn', 'ass', 'bitch',
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

		// Vista previa del documento que el usuario subió, para poder verlo en el chat
		const fileUrl = URL.createObjectURL(file);
		this.objectUrls.push(fileUrl);

		this.pushUser(userMsg, fileUrl, file.name, isPdf ? 'pdf' : 'image');
		this.pushBot(`Recibí tu ${isPdf ? 'PDF' : 'imagen'} 📄 Déjame analizarlo un momento...`);
		this.userInput = '';
		this.selectedFile = null;
		this.isLoading = true;
		this.shouldScroll = true;

		this.chatbot.validateDocument(file).subscribe({
			next: (res) => {
				this.pushBot(res.result, true, res.estado);
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

	private pushUser(
		content: string,
		fileUrl?: string,
		fileName?: string,
		fileKind?: ChatMessage['fileKind'],
	): void {
		this.messages.push({ role: 'user', content, fileUrl, fileName, fileKind, timestamp: new Date() });
	}

	private pushBot(
		content: string,
		isDocument = false,
		docEstado?: ChatMessage['docEstado'],
		packages?: TravelPackage[],
		quickReplies?: QuickReply[],
	): void {
		this.messages.push({ role: 'bot', content, isDocument, docEstado, packages, quickReplies, timestamp: new Date() });
	}

	private scrollToBottom(): void {
		try {
			this.messagesEnd.nativeElement.scrollIntoView({ behavior: 'smooth' });
		} catch { }
	}
}