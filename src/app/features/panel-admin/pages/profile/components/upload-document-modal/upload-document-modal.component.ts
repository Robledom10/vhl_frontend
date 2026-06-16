import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { DocumentManagementService } from '../../../../../../core/services/document-management.service';

@Component({
	selector: 'app-upload-document-modal',
	templateUrl: './upload-document-modal.component.html',
	styleUrl: './upload-document-modal.component.css'
})
export class UploadDocumentModalComponent {

	@Input() isOpen = false;
	@Input() reservationId!: number;
	@Input() userId!: number;

	@Output() closed = new EventEmitter<void>();
	@Output() uploaded = new EventEmitter<void>();

	selectedType = '';
	selectedFile!: File;

	dropdownOpen = false;
	selectedTypeLabel = '';

	constructor(
		private documentService: DocumentManagementService
	) { }

	selectType(type: string, label: string): void {
		this.selectedType = type;
		this.selectedTypeLabel = label;
		this.dropdownOpen = false;
	}

	onFileSelected(event: Event): void {

		const input = event.target as HTMLInputElement;

		if (input.files?.length) {
			this.selectedFile = input.files[0];
		}
	}

	upload(): void {
		if (!this.selectedFile || !this.selectedType) {
			return;
		}

		this.documentService
			.uploadDocument(
				this.userId,
				this.selectedType,
				this.selectedFile
			)
			.subscribe({

				next: () => {
					this.uploaded.emit();
				},

				error: (err) => {
					console.error(err);
				}
			});
	}

	@HostListener('document:click')
	closeDropdown(): void {
		this.dropdownOpen = false;
	}
}
