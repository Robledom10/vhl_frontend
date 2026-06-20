import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { DocumentManagementService } from '../../../../../../core/services/document-management.service';
import { TravelerDocument } from '../../models/document-management';

@Component({
	selector: 'app-document-viewer',
	templateUrl: './document-viewer.component.html',
	styleUrl: './document-viewer.component.css'
})
export class DocumentViewerComponent implements OnChanges {

	@Input() isOpen = false;
	@Input() userId!: number;
	@Output() closed = new EventEmitter<void>();

	documents: TravelerDocument[] = [];
	isLoading = false;

	// ===========================
	// RECHAZO (Frontend)
	// ===========================

	selectedRejectDocument: TravelerDocument | null = null;
	rejectMessage = '';

	constructor(
		private documentService: DocumentManagementService
	) { }

	// ==================================================
	// CICLO DE VIDA
	// ==================================================

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['isOpen']?.currentValue && this.userId) {
			this.loadDocuments();
		}
	}

	// ==================================================
	// CARGAR DOCUMENTOS
	// ==================================================

	loadDocuments(): void {

		this.isLoading = true;
		this.cancelReject();

		this.documentService
			.getUserDocuments(this.userId)
			.subscribe({

				next: (documents) => {
					this.documents = documents;
					this.isLoading = false;
				},

				error: () => {
					this.documents = [];
					this.isLoading = false;
				}
			});
	}

	// ==================================================
	// CERRAR
	// ==================================================

	close(): void {
		this.cancelReject();
		this.closed.emit();
	}

	// ==================================================
	// VER DOCUMENTO
	// ==================================================

	viewDocument(documentId: number): void {

		this.documentService
			.downloadDocument(documentId)
			.subscribe({

				next: response => {

					const blob = new Blob(
						[response.body!],
						{
							type:
								response.headers.get('Content-Type')
								|| 'application/pdf'
						}
					);

					const url = URL.createObjectURL(blob);

					window.open(url, '_blank');

					setTimeout(() => {

						URL.revokeObjectURL(url);

					}, 1000);
				}
			});
	}

	// ==================================================
	// FLUJO DE REVISIÓN (TEMPORAL FRONTEND)
	// ==================================================

	startReview(doc: TravelerDocument): void {
		this.documentService
			.startReview(doc.idDocument)
			.subscribe({

				next: () => {
					doc.status = 'en_proceso';
				}
			});
	}

	approveDocument(doc: TravelerDocument): void {
		this.cancelReject();
		this.documentService
			.approveDocument(doc.idDocument)
			.subscribe({

				next: () => {
					doc.status = 'aprobado';
				}
			});
	}

	showRejectForm(doc: TravelerDocument): void {
		if (this.selectedRejectDocument?.idDocument === doc.idDocument) {
			this.cancelReject();
			return;
		}

		this.selectedRejectDocument = doc;
		this.rejectMessage = '';
	}

	cancelReject(): void {
		this.selectedRejectDocument = null;
		this.rejectMessage = '';
	}

	confirmReject(): void {
		if (!this.selectedRejectDocument) {
			return;
		}

		this.documentService
			.rejectDocument(
				this.selectedRejectDocument.idDocument,
				this.rejectMessage
			)
			.subscribe({
				next: () => {
					this.selectedRejectDocument!.status = 'rechazado';
					this.cancelReject();
				}
			});
	}

	// ==================================================
	// UTILIDADES
	// ==================================================

	getDocumentName(type: string): string {
		switch (type) {
			case 'cedula':
				return 'Cédula';

			case 'pasaporte':
				return 'Pasaporte';

			case 'visa':
				return 'Visa';

			case 'vacuna':
				return 'Carnet de vacuna';

			case 'permiso_menor':
				return 'Permiso de menor';

			default:
				return 'Otro';
		}
	}

	getStatus(status: string): string {
		switch (status) {

			case 'pendiente':
				return 'Pendiente';

			case 'en_proceso':
				return 'En proceso';

			case 'aprobado':
				return 'Aprobado';

			case 'rechazado':
				return 'Rechazado';

			default:
				return status;
		}
	}

	getFileName(path: string): string {
		return path?.split('/').pop() ?? '';
	}

	getFileIcon(path: string): string {
		const extension = path
			?.split('.')
			.pop()
			?.toLowerCase();

		switch (extension) {
			case 'pdf':
				return 'fa-file-pdf';

			case 'jpg':
			case 'jpeg':
			case 'png':
			case 'webp':
				return 'fa-file-image';

			case 'doc':
			case 'docx':
				return 'fa-file-word';

			case 'xls':
			case 'xlsx':
				return 'fa-file-excel';

			default:
				return 'fa-file';
		}
	}

	// ==================================================
	// CONTADORES
	// ==================================================

	get pendingCount(): number {
		return this.documents.filter(
			document => document.status === 'pendiente'
		).length;
	}

	get inProcessCount(): number {
		return this.documents.filter(
			document => document.status === 'en_proceso'
		).length;
	}

	get approvedCount(): number {
		return this.documents.filter(
			document => document.status === 'aprobado'
		).length;
	}

	get rejectedCount(): number {
		return this.documents.filter(
			document => document.status === 'rechazado'
		).length;
	}
}