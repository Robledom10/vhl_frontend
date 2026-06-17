import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { DocumentManagementService } from '../../../../../../core/services/document-management.service';

@Component({
	selector: 'app-upload-document-modal',
	templateUrl: './upload-document-modal.component.html',
	styleUrl: './upload-document-modal.component.css'
})
export class UploadDocumentModalComponent implements OnChanges {

	@Input() isOpen = false;
	@Input() reservationId!: number;
	@Input() userId!: number;

	@Output() closed = new EventEmitter<void>();
	@Output() uploaded = new EventEmitter<void>();

	selectedType = '';
	selectedFile: File | null = null;
	dropdownOpen = false;
	selectedTypeLabel = '';

	constructor(
		private documentService: DocumentManagementService,
	) { }

	ngOnChanges(): void {
		if (!this.isOpen) {
			this.resetForm();
		}
	}

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
					this.resetForm();
					this.uploaded.emit();
				},

				error: (err) => {
					console.error(err);
				}
			});
	}

	resetForm(): void {
		this.selectedType = '';
		this.selectedTypeLabel = '';
		this.dropdownOpen = false;
		this.selectedFile = null;
	}

	closeModal(): void {
		this.resetForm();
		this.closed.emit();
	}

	toggleDropdown(): void {
		this.dropdownOpen = !this.dropdownOpen;
	}

	onModalClick(event: Event): void {
		event.stopPropagation();
		const target = event.target as HTMLElement;

		if (!target.closest('.custom-select')) {
			this.dropdownOpen = false;
		}
	}
}