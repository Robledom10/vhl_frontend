import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DocumentManagementService } from '../../../../../../core/services/document-management.service';

@Component({
	selector: 'app-document-viewer',
	templateUrl: './document-viewer.component.html',
	styleUrl: './document-viewer.component.css'
})
export class DocumentViewerComponent {
	@Input() isOpen = false;

	@Input() documents: any[] = [];

	@Output() closed =
		new EventEmitter<void>();

	constructor(
		private documentService:
			DocumentManagementService
	) { }

	close(): void {
		this.closed.emit();
	}

	viewDocument(
		documentId: number
	): void {

		this.documentService
			.downloadDocument(documentId)
			.subscribe({

				next: blob => {

					const url =
						URL.createObjectURL(blob);

					window.open(
						url,
						'_blank'
					);
				}
			});
	}
}
