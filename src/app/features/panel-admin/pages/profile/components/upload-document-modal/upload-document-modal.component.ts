import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { DocumentManagementService } from '../../../../../../core/services/document-management.service';

type FileStatus = 'pending' | 'uploading' | 'success' | 'error';

interface UploadFile {
	file: File;
	progress: number;
	status: FileStatus;
}

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
	selectedTypeLabel = '';
	dropdownOpen = false;

	uploadedFiles: UploadFile[] = [];

	isUploading = false;

	readonly maxFileSize = 10 * 1024 * 1024;
	readonly maxFiles = 10;
	readonly allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];

	constructor(private documentService: DocumentManagementService) { }

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['isOpen'] && !changes['isOpen'].currentValue) {
			this.resetForm();
		}
	}

	selectType(type: string, label: string): void {
		this.selectedType = type;
		this.selectedTypeLabel = label;
		this.dropdownOpen = false;
	}

	// ✅ FILES
	onFileSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		if (!input.files?.length) return;

		if (this.uploadedFiles.length + input.files.length > this.maxFiles) {
			alert(`Solo puede subir ${this.maxFiles} archivos.`);
			input.value = '';
			return;
		}

		Array.from(input.files).forEach(file => {
			if (!this.isValidFile(file)) return;

			const exists = this.uploadedFiles.some(f => f.file.name === file.name);

			if (!exists) {
				this.uploadedFiles.push({
					file,
					progress: 0,
					status: 'pending'
				});
			}
		});

		input.value = '';
	}

	removeFile(index: number): void {
		if (this.isUploading) return;
		this.uploadedFiles.splice(index, 1);
	}

	// 🚀 UPLOAD CON PROGRESO
	upload(): void {

		if (!this.selectedType) {
			alert('Seleccione el tipo de documento.');
			return;
		}

		if (!this.uploadedFiles.length) {
			alert('Seleccione al menos un archivo.');
			return;
		}

		this.isUploading = true;

		const requests = this.uploadedFiles.map(item => {

			item.status = 'uploading';

			// 🔵 progreso simulado (si backend no lo soporta)
			this.simulateProgress(item);

			return this.documentService.uploadDocument(
				this.userId,
				this.reservationId,
				this.selectedType,
				item.file
			).pipe(
				tap(() => {
					item.progress = 100;
					item.status = 'success';
				}),
				catchError(err => {
					console.error(err);
					item.status = 'error';
					return of(null);
				})
			);
		});

		forkJoin(requests).subscribe(() => {
			this.isUploading = false;
			this.uploaded.emit();
			this.resetForm();
		});
	}

	// 🎯 progreso simulado suave
	private simulateProgress(item: UploadFile): void {
		const interval = setInterval(() => {

			if (item.status !== 'uploading') {
				clearInterval(interval);
				return;
			}

			if (item.progress < 90) {
				item.progress += Math.random() * 15;
			}

		}, 200);
	}

	private isValidFile(file: File): boolean {
		const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

		if (!this.allowedExtensions.includes(ext)) {
			alert(`${file.name} no permitido`);
			return false;
		}

		if (file.size > this.maxFileSize) {
			alert(`${file.name} supera 10MB`);
			return false;
		}

		return true;
	}

	resetForm(): void {
		this.selectedType = '';
		this.selectedTypeLabel = '';
		this.dropdownOpen = false;
		this.uploadedFiles = [];
		this.isUploading = false;
	}

	closeModal(): void {
		if (this.isUploading) return;

		this.resetForm();
		this.closed.emit();
	}

	toggleDropdown(): void {
		this.dropdownOpen = !this.dropdownOpen;
	}

	onModalClick(event: Event): void {
		event.stopPropagation();

		if (!(event.target as HTMLElement).closest('.custom-select')) {
			this.dropdownOpen = false;
		}
	}
}