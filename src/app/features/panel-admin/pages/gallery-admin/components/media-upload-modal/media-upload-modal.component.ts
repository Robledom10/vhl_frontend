import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MediaService } from '../../../../../../core/services/media.service';

@Component({
  selector: 'app-media-upload-modal',
  templateUrl: './media-upload-modal.component.html',
  styleUrl: './media-upload-modal.component.css',
})
export class MediaUploadModalComponent {
  @Input() isOpen = false;

  @Output() closed = new EventEmitter<void>();

  preview: string | null = null;

  selectedFile!: File;

  loading = false;

  currentYear = new Date().getFullYear();

  years: number[] = [];

  constructor(
    private fb: FormBuilder,
    private mediaService: MediaService,
  ) {
    this.generateYears();
  }

  mediaForm = this.fb.group({
    type: ['', Validators.required],

    year: ['', Validators.required],

    excursion: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
    ],

    location: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
    ],
  });

  generateYears() {
    for (let year = this.currentYear; year >= 2023; year--) {
      this.years.push(year);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    const file = input.files[0];

    this.selectedFile = file;

    const reader = new FileReader();

    reader.onload = () => {
      this.preview = reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  submit() {
    if (this.mediaForm.invalid || !this.selectedFile) {
      this.mediaForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const formData = new FormData();

    formData.append('file', this.selectedFile);

    const payload = {
      type: this.mediaForm.value.type,
      year: Number(this.mediaForm.value.year),
      excursion: this.mediaForm.value.excursion,
      location: this.mediaForm.value.location,
    };

    formData.append('data', JSON.stringify(payload));

    this.mediaService.uploadMedia(formData).subscribe({
      next: () => {
        this.loading = false;
        this.close();
      },

      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  removeFile(event: Event) {
    event.stopPropagation();

    this.preview = null;

    this.selectedFile = null as any;
  }

  close() {
    this.closed.emit();
  }
}
