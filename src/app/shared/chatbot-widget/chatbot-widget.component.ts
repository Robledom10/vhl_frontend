import { Component, ElementRef, OnInit, OnDestroy, ViewChild, AfterViewChecked } from '@angular/core';
import { ChatbotService, ChatMessage, QuickReply } from '../../core/services/chatbot.service';
import { PackageService } from '../../core/services/package.service';
import { RespuestaPaqueteTuristico } from '../../features/panel-admin/models/package.model';
import { PackageDetail } from '../package-detail-sheet/package-detail-sheet.component';
import { TravelPackage, mapToTravelPackage, mapToPackageDetail, mapToPackageDetailFallback } from '../utils/package-mapper';

const QUICK_REPLIES: QuickReply[] = [
	{ label: '📦 Ver paquetes y precios', action: 'show_packages' },
	{ label: '🧳 ¿Cómo reservo?', action: 'message', payload: '¿Cómo puedo reservar un paquete paso a paso?' },
	{ label: '📋 Mis reservas', action: 'reservations' },
	{ label: '📄 Validar mi voucher', action: 'upload' },
	{ label: '💳 ¿Cómo pago?', action: 'message', payload: '¿Cómo funcionan los pagos en la plataforma?' },
	{ label: '❓ Preguntas frecuentes', action: 'faq_menu' },
];

const CONTINUE_REPLIES: QuickReply[] = [
	{ label: '💬 Sí, tengo otra pregunta', action: 'menu' },
	{ label: '👋 No, listo — salir', action: 'exit' },
];


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
			'Podés cancelar desde tu perfil > "Mis Reservas". En general: cancelación gratuita hasta 5 días antes, ' +
			'50% de reembolso con 48 horas de anticipación y sin devolución el mismo día del viaje. ' +
			'Revisá la política específica de tu paquete porque puede variar.',
	},
	{
		id: 'pago-tarde',
		question: '¿Qué pasa si no pago a tiempo?',
		answer:
			'Si no completás el pago antes de la fecha límite, el cupo se libera y deberás reservar de nuevo ' +
			'sujeto a disponibilidad. Te recomendamos pagar por Wompi lo antes posible para asegurar tu lugar.',
	},
	{
		id: 'menor-edad',
		question: '¿Puedo viajar con un menor de edad?',
		answer:
			'Sí, pero el menor debe viajar con permiso firmado por los padres o tutores legales y cumplir la edad ' +
			'mínima del paquete. Revisá los requisitos de cada paquete antes de reservar.',
	},
	{
		id: 'documentos',
		question: '¿Qué documentos necesito para viajar?',
		answer:
			'Para destinos nacionales (Colombia) vas con tu cédula de ciudadanía o tarjeta de identidad si sos menor de edad. ' +
			'Para destinos internacionales necesitás pasaporte vigente con mínimo 6 meses de validez. ' +
			'Algunos paquetes también piden el voucher de pago y el permiso firmado para menores.',
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

	likedPackageIds = new Set<number>();

	private shouldScroll = false;
	private objectUrls: string[] = [];
	private cachedApiPackages: RespuestaPaqueteTuristico[] = [];
	private pkgByIdMap = new Map<number, TravelPackage>();

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
			this.shouldScroll = true;
			return;
		}
		if (option.action === 'reservations') {
			this.pushBot(
				'Para ver tus reservas entrá a tu Perfil > "Mis Reservas" en el menú principal. ' +
				'Ahí encontrás el estado de pago, el itinerario día a día y todos los detalles de cada tour que reservaste. 🦈',
				false, undefined, undefined,
				[{ label: '← Volver al menú', action: 'menu' }]
			);
			this.shouldScroll = true;
			return;
		}
		if (option.action === 'exit') {
			this.pushBot('¡Fue un placer, parcero! 🦈 Cuando quieras volver, aquí estoy. ¡Buen viaje!');
			this.shouldScroll = true;
			setTimeout(() => this.closeChat(), 1800);
			return;
		}
		if (option.action === 'compare') {
			this.pushBot(
				'¡Al pelo! 🦈 Decime los nombres o destinos de los dos paquetes que querés comparar y te cuento las diferencias.',
				false, undefined, undefined,
				[{ label: '← Volver al menú', action: 'menu' }]
			);
			this.shouldScroll = true;
			return;
		}
		if (option.action === 'filter_menu') {
			this.showFilterMenu();
			return;
		}
		if (option.action === 'filter_budget_menu') {
			this.pushBot('¿Cuál es tu presupuesto? 🦈', false, undefined, undefined, [
				{ label: '💰 Menos de $500k', action: 'filter_budget', payload: 'low' },
				{ label: '💸 $500k – $1M', action: 'filter_budget', payload: 'mid' },
				{ label: '💎 Más de $1M', action: 'filter_budget', payload: 'high' },
				{ label: '← Buscar por otro criterio', action: 'filter_menu' },
			]);
			this.shouldScroll = true;
			return;
		}
		if (option.action === 'filter_duration_menu') {
			this.pushBot('¿Cuánto tiempo tenés? 🦈', false, undefined, undefined, [
				{ label: '🗓 Fin de semana (1–2 días)', action: 'filter_duration', payload: 'short' },
				{ label: '🗓 3 a 5 días', action: 'filter_duration', payload: 'medium' },
				{ label: '🗓 Más de 5 días', action: 'filter_duration', payload: 'long' },
				{ label: '← Buscar por otro criterio', action: 'filter_menu' },
			]);
			this.shouldScroll = true;
			return;
		}
		if (option.action === 'filter_budget') {
			const ranges: Record<string, [number, number]> = {
				low: [0, 499999], mid: [500000, 999999], high: [1000000, Infinity],
			};
			const [min, max] = ranges[option.payload ?? 'low'];
			this.filterPackages(option.label, p => p.price >= min && p.price <= max);
			return;
		}
		if (option.action === 'filter_duration') {
			const ranges: Record<string, [number, number]> = {
				short: [1, 2], medium: [3, 5], long: [6, 999],
			};
			const [min, max] = ranges[option.payload ?? 'short'];
			this.filterPackages(option.label, p => p.nights >= min && p.nights <= max);
			return;
		}
		if (option.action === 'filter_type') {
			this.userInput = `Muéstrame paquetes de ${option.payload}`;
			this.sendMessage();
			return;
		}
		if (option.action === 'pkg_detail') {
			const id = Number(option.payload);
			const api = this.cachedApiPackages.find(p => p.id === id);
			const travel = this.pkgByIdMap.get(id);
			this.selectedPackageDetail = api ? mapToPackageDetail(api) : (travel ? mapToPackageDetailFallback(travel) : null);
			if (this.selectedPackageDetail) this.sheetOpen = true;
			return;
		}
		this.userInput = option.payload ?? '';
		this.sendMessage();
	}

	private showFilterMenu(): void {
		this.pushBot('¿Cómo querés buscar tu plan? 🦈', false, undefined, undefined, [
			{ label: '💰 Por presupuesto', action: 'filter_budget_menu' },
			{ label: '⏱ Por duración', action: 'filter_duration_menu' },
			{ label: '🏖 Playa', action: 'filter_type', payload: 'playa o destino de costa' },
			{ label: '🏔 Aventura', action: 'filter_type', payload: 'aventura o naturaleza' },
			{ label: '← Menú principal', action: 'menu' },
		]);
		this.shouldScroll = true;
	}

	private filterPackages(label: string, predicate: (p: TravelPackage) => boolean): void {
		this.pushUser(label);
		this.isLoading = true;
		this.shouldScroll = true;

		const doFilter = (apiPkgs: RespuestaPaqueteTuristico[]) => {
			const all = apiPkgs.map(mapToTravelPackage);
			all.forEach(p => this.pkgByIdMap.set(p.id, p));
			const filtered = all.filter(predicate);
			this.isLoading = false;
			if (filtered.length === 0) {
				this.pushBot('No encontré paquetes con ese criterio 🦈 ¿Probamos con otro filtro?', false, undefined, undefined, [
					{ label: '🔍 Buscar de nuevo', action: 'filter_menu' },
					{ label: '📦 Ver todos los paquetes', action: 'show_packages' },
				]);
			} else {
				this.pushBot(
					`Encontré ${filtered.length} paquete${filtered.length !== 1 ? 's' : ''} 🦈 Tocá cualquiera para ver el detalle.`,
					false, undefined, filtered,
					[{ label: '🔍 Buscar con otro filtro', action: 'filter_menu' }]
				);
			}
			this.shouldScroll = true;
		};

		if (this.cachedApiPackages.length > 0) {
			doFilter(this.cachedApiPackages);
			this.isLoading = false;
		} else {
			this.packageService.getPackages({ activo: true, tamano: 50 }).subscribe({
				next: (page) => { this.cachedApiPackages = page.content; doFilter(page.content); },
				error: () => {
					this.isLoading = false;
					this.pushBot('No pude cargar los paquetes. Intenta de nuevo en un momento 🙏');
					this.shouldScroll = true;
				},
			});
		}
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
				packages.forEach(p => this.pkgByIdMap.set(p.id, p));
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

	toggleLike(pkg: TravelPackage, event: Event): void {
		event.stopPropagation();
		if (this.likedPackageIds.has(pkg.id)) {
			this.likedPackageIds.delete(pkg.id);
			return;
		}
		this.likedPackageIds.add(pkg.id);
		this.pushBot(
			`¡Qué nota! Guardé "${pkg.name}" en tus intereses 🦈 ¿Querés ver el detalle completo o saber cómo reservarlo?`,
			false, undefined, undefined,
			[
				{ label: '📋 Ver detalles', action: 'pkg_detail', payload: String(pkg.id) },
				{ label: '🧳 Cómo lo reservo', action: 'message', payload: `¿Cómo reservo el paquete ${pkg.name}?` },
			]
		);
		this.shouldScroll = true;
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

	scrollPkgs(el: HTMLElement, dir: 1 | -1): void {
		el.scrollBy({ left: dir * 230, behavior: 'smooth' });
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
				this.pushBot(res.reply, false, undefined, undefined, CONTINUE_REPLIES);
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
				this.pushBot(res.result, true, res.estado, undefined, CONTINUE_REPLIES);
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