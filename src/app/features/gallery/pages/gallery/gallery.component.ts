import { Component, OnInit } from '@angular/core';
import { MediaResponse, MediaService } from '../../../../core/services/media.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css',
})
export class GalleryComponent implements OnInit {
  media: MediaResponse[] = [];
  loading = true;

  constructor(private mediaService: MediaService) {}

  ngOnInit(): void {
    this.loadMedia();
  }

  loadMedia() {
    this.loading = true;

    this.mediaService.getAll().subscribe({
      next: (data) => {
        this.media = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando galería', err);
        this.loading = false;
      },
    });
  }
}
