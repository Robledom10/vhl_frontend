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

	constructor(private documentService: DocumentManagementService) { }

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['isOpen']?.currentValue && this.userId) {
			this.loadDocuments();
		}
	}

	loadDocuments(): void {
		this.isLoading = true;

		this.documentService.getUserDocuments(this.userId)
			.subscribe({
				next: docs => {
					this.documents = docs;
					this.isLoading = false;
				},
				error: () => {
					this.documents = [];
					this.isLoading = false;
				}
			});
	}

	close(): void {
		this.closed.emit();
	}

	viewDocument(documentId: number): void {
		this.documentService.downloadDocument(documentId)
			.subscribe({
				next: response => {

					const blob = new Blob([response.body!], {
						type: response.headers.get('Content-Type') || 'application/pdf'
					});

					const url = URL.createObjectURL(blob);
					window.open(url, '_blank');

					setTimeout(() => URL.revokeObjectURL(url), 1000);
				}
			});
	}

	approveDocument(doc: TravelerDocument): void {
		this.documentService.validateDocument(doc.idDocument)
			.subscribe(() => {
				doc.status = 'aprobado';
			});
	}

	rejectDocument(doc: TravelerDocument): void {
		this.documentService.validateDocument(doc.idDocument)
			.subscribe(() => {
				doc.status = 'rechazado';
			});
	}

	getDocumentName(type: string): string {
		switch (type) {
			case 'cedula': return 'Cédula';
			case 'pasaporte': return 'Pasaporte';
			case 'visa': return 'Visa';
			case 'vacuna': return 'Carnet de vacuna';
			case 'permiso_menor': return 'Permiso de menor';
			default: return 'Otro';
		}
	}

	getStatus(status: string): string {
		switch (status) {
			case 'pendiente': return 'Pendiente';
			case 'en_proceso': return 'En proceso';
			case 'aprobado': return 'Aprobado';
			case 'rechazado': return 'Rechazado';
			default: return status;
		}
	}

	getFileName(path: string): string {
		return path?.split('/').pop() ?? '';
	}

	getFileIcon(path: string): string {
		const ext = path?.split('.').pop()?.toLowerCase();

		switch (ext) {
			case 'pdf': return 'fa-file-pdf';
			case 'jpg':
			case 'jpeg':
			case 'png':
				return 'fa-file-image';
			case 'doc':
			case 'docx':
				return 'fa-file-word';
			default:
				return 'fa-file';
		}
	}

	get pendingCount() {
		return this.documents.filter(d => d.status === 'pendiente').length;
	}

	get approvedCount() {
		return this.documents.filter(d => d.status === 'aprobado').length;
	}

	get rejectedCount() {
		return this.documents.filter(d => d.status === 'rechazado').length;
	}
}