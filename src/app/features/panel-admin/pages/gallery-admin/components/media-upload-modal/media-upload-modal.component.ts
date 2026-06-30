import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MediaResponse, MediaService } from '../../../../../../core/services/media.service';

@Component({
	selector: 'app-media-upload-modal',
	templateUrl: './media-upload-modal.component.html',
	styleUrl: './media-upload-modal.component.css',
})
export class MediaUploadModalComponent implements OnChanges {
	@Input() isOpen = false;
	@Output() closed = new EventEmitter<boolean>();
	@Output() notify = new EventEmitter<{ title: string; message: string; type: 'success' | 'edit' | 'delete' | 'error' }>();
	@Input() media: MediaResponse | null = null;
	previews: string[] = [];
	selectedFiles: File[] = [];
	loading = false;
	currentYear = new Date().getFullYear();
	years: number[] = [];
	showConfirmModal = false;

	constructor(
		private fb: FormBuilder,
		private mediaService: MediaService,
	) {
		this.generateYears();
	}

	mediaForm = this.fb.group({
		type: [{ value: '', disabled: true }, Validators.required],
		year: ['', Validators.required],
		excursion: [
			'',
			[Validators.required, Validators.minLength(3), Validators.maxLength(50)],
		],

		activity: [
			'',
			[Validators.required, Validators.minLength(3), Validators.maxLength(50)],
		],
	});

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['media'] && this.media) {
			this.mediaForm.patchValue({
				type: this.media.type,
				year: this.media.year.toString(),
				excursion: this.media.excursion,
				activity: this.media.activity,
			});

			this.previews = [this.media.url];
		}
	}

	generateYears() {
		for (let year = this.currentYear; year >= 2023; year--) {
			this.years.push(year);
		}
	}

	onFileSelected(event: Event) {
		const input = event.target as HTMLInputElement;

		if (!input.files?.length) return;

		const files = Array.from(input.files);
		this.selectedFiles = files;
		this.previews = [];

		// =========================================
		// DETECTAR TIPO AUTOMÁTICAMENTE
		// =========================================

		const hasVideo = files.some((file) => file.type.startsWith('video'));

		this.mediaForm.patchValue({
			type: hasVideo ? 'VIDEO' : 'IMAGE',
		});

		// =========================================
		// GENERAR PREVIEWS
		// =========================================

		files.forEach((file) => {
			const reader = new FileReader();

			reader.onload = () => {
				this.previews.push(reader.result as string);
			};

			reader.readAsDataURL(file);
		});
	}

	// =========================================
	// VALIDAR Y ABRIR CONFIRMACIÓN
	// =========================================

	requestSubmit() {
		if (this.mediaForm.invalid) {
			this.mediaForm.markAllAsTouched();
			return;
		}

		if (!this.media && !this.selectedFiles.length) {
			this.mediaForm.markAsTouched();
			return;
		}

		this.showConfirmModal = true;
	}

	closeConfirmModal() {
		this.showConfirmModal = false;
	}

	confirmSubmit() {
		this.showConfirmModal = false;
		this.submit();
	}

	private submit() {
		this.loading = true;
		const formData = new FormData();

		if (this.selectedFiles.length) {
			formData.append('file', this.selectedFiles[0]);
		}

		const raw = this.mediaForm.getRawValue();

		const payload = {
			type: raw.type,
			year: Number(raw.year),
			excursion: raw.excursion,
			activity: raw.activity,
		};

		formData.append('data', JSON.stringify(payload));

		// =========================================
		// UPDATE
		// =========================================

		if (this.media) {
			this.mediaService.updateMedia(this.media.id, formData).subscribe({
				next: () => {
					this.loading = false;
					this.resetModal();
					this.notify.emit({
						title: 'Archivo actualizado',
						message: 'El archivo fue actualizado correctamente.',
						type: 'success',
					});
					this.closed.emit(true);
				},

				error: (err) => {
					console.error(err);
					this.loading = false;
					this.notify.emit({
						title: 'Error al actualizar',
						message: 'No se pudo actualizar el archivo. Intenta nuevamente.',
						type: 'error',
					});
				},
			});

			return;
		}

		// =========================================
		// CREATE
		// =========================================

		if (this.selectedFiles.length) {
			const createFormData = new FormData();

			this.selectedFiles.forEach((file) => {
				createFormData.append('files', file);
			});

			createFormData.append('data', JSON.stringify(payload));

			this.mediaService.uploadMedia(createFormData).subscribe({
				next: () => {
					this.loading = false;
					this.resetModal();
					this.notify.emit({
						title: 'Archivo agregado',
						message: 'El archivo fue subido correctamente.',
						type: 'success',
					});
					this.closed.emit(true);
				},

				error: (err) => {
					console.error(err);
					this.loading = false;
					this.notify.emit({
						title: 'Error de subida',
						message: 'No se pudo subir el archivo. Intenta nuevamente.',
						type: 'error',
					});
				},
			});
		}
	}

	removeFile(index: number, event: Event) {
		event.stopPropagation();

		if (this.selectedFiles.length) {
			this.selectedFiles.splice(index, 1);
		}

		this.previews.splice(index, 1);

		if (!this.selectedFiles.length && !this.media) {
			this.mediaForm.patchValue({
				type: '',
			});
		}
	}

	resetModal() {
		this.previews = [];
		this.selectedFiles = [];
		this.loading = false;
		this.mediaForm.reset();
		this.mediaForm.markAsPristine();
		this.mediaForm.markAsUntouched();
		this.media = null;
	}

	close() {
		this.resetModal();
		this.closed.emit(false);
	}
}