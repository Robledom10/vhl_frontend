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

	constructor(
		private documentService: DocumentManagementService
	) { }

	ngOnChanges(changes: SimpleChanges): void {

		if (
			changes['isOpen']?.currentValue &&
			this.userId
		) {
			this.loadDocuments();
		}
	}

	loadDocuments(): void {

		this.isLoading = true;

		this.documentService
			.getUserDocuments(this.userId)
			.subscribe({

				next: docs => {

					this.documents = docs;
					this.isLoading = false;
				},

				error: err => {

					console.error(err);
					this.documents = [];
					this.isLoading = false;
				}
			});
	}

	close(): void {

		this.closed.emit();
	}

	viewDocument(documentId: number): void {

		this.documentService
			.downloadDocument(documentId)
			.subscribe({

				next: blob => {

					const url = URL.createObjectURL(blob);

					window.open(url, '_blank');
				}
			});
	}

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
}
