import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';

declare var google: any;

interface Destination {
  id: string;
  name: string;
  label: string;
  image: string;
  description: string;
  lat: number;
  lng: number;
  placeId: string;
  photos: string[];
  thumbnail: string;
  photosLoaded: boolean;
}

@Component({
  selector: 'app-interactive-map',
  templateUrl: './interactive-map.component.html',
  styleUrl: './interactive-map.component.css',
})
export class InteractiveMapComponent implements OnInit, OnDestroy {
  private map: any = null;
  private markers: any[] = [];
  private markerBubbles: Map<string, HTMLImageElement> = new Map();

  isDropdownOpen = false;
  selectedDestination: Destination | null = null;
  isLoadingPhotos = false;
  activePhotoIndex = 0;

  destinations: Destination[] = [
    {
      id: 'quindio',
      name: 'Hernando Lopera',
      label: 'Calraca, Quindio',
      image:
        'https://res.cloudinary.com/dqcviyp18/image/upload/v1780001558/image_g9cu67.png',
      description:
        'El corazón del Eje Cafetero. Valle del Cocora, palmas de cera, fincas cafeteras y el encanto de sus pueblos patrimonio.',
      lat: 4.5318,
      lng: -75.6442,
      placeId: 'ChIJx8bT4x7Koo8R7x4X0sJfR5M',
      photos: [],
      thumbnail: '',
      photosLoaded: false,
    },

    {
      id: 'santamarta',
      name: 'Santa Marta',
      label: 'Magdalena, Colombia',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/El_Rodadero%2C_Santa_Marta.jpg/640px-El_Rodadero%2C_Santa_Marta.jpg',
      description:
        'La ciudad más antigua de Colombia. Playas paradisíacas, la Sierra Nevada y el Parque Tayrona.',
      lat: 11.2408,
      lng: -74.211,
      placeId: 'ChIJRcbVhzJa-o4Rz5GJkFDZ1uE',
      photos: [],
      thumbnail: '',
      photosLoaded: false,
    },
    {
      id: 'cartagena',
      name: 'Cartagena',
      label: 'Bolívar, Colombia',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Cartagena_de_Indias_-_Centro_Historico.jpg/640px-Cartagena_de_Indias_-_Centro_Historico.jpg',
      description:
        'Ciudad amurallada Patrimonio de la Humanidad. Historia colonial, islas del Rosario y playas del Caribe.',
      lat: 10.391,
      lng: -75.4794,
      placeId: 'ChIJp9r1aNIm-Y4RVWBS3g8Xv6A',
      photos: [],
      thumbnail: '',
      photosLoaded: false,
    },
    {
      id: 'barranquilla',
      name: 'Barranquilla',
      label: 'Atlántico, Colombia',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Barranquilla_panoramica.jpg/640px-Barranquilla_panoramica.jpg',
      description:
        'La capital de la alegría. Sede del famoso Carnaval declarado Patrimonio Inmaterial de la Humanidad.',
      lat: 10.9685,
      lng: -74.7813,
      placeId: 'ChIJR1fBKzR6-Y4RAoGRzMsU2bE',
      photos: [],
      thumbnail: '',
      photosLoaded: false,
    },
    {
      id: 'medellin',
      name: 'Medellín',
      label: 'Antioquia, Colombia',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Medellin_Vista_Parcial.jpg/640px-Medellin_Vista_Parcial.jpg',
      description:
        'La ciudad de la eterna primavera. Innovación, cultura, flores y la calidez de su gente paisa.',
      lat: 6.2442,
      lng: -75.5812,
      placeId: 'ChIJaUjKMaKRRI8R9VsEUJM2fLI',
      photos: [],
      thumbnail: '',
      photosLoaded: false,
    },
  ];

  constructor(private ngZone: NgZone) { }

  ngOnInit(): void {
    this.loadGoogleMaps();
  }

  // ─── Carga del SDK ──────────────────────────────────────────────────────────

  loadGoogleMaps(): void {
    if (typeof google !== 'undefined' && google.maps?.Map) {
      this.initMap();
      return;
    }
    (window as any)['initMapCallback'] = () =>
      this.ngZone.run(() => this.initMap());
    const script = document.createElement('script');
    script.src =
      'https://maps.googleapis.com/maps/api/js?key=AIzaSyCChhbt5C8uOtQrdF6lFwEYaHxbtuFcNmE&libraries=marker,places&loading=async&callback=initMapCallback';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  initMap(): void {
    this.map = new google.maps.Map(document.getElementById('travel-map'), {
      center: { lat: 7.5, lng: -75.2 },
      zoom: 6,
      minZoom: 5,
      maxZoom: 18,
      mapId: 'DEMO_MAP_ID',
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
    });

    this.addMarkersToMap();
  }

  // ─── Marcadores con imagen estática ────────────────────────────────────────

  addMarkersToMap(): void {
    this.destinations.forEach((dest) => {
      const pinEl = document.createElement('div');
      pinEl.style.cssText = `display: flex; flex-direction: column; align-items: center; cursor: pointer;`;

      const bubble = document.createElement('div');
      bubble.style.cssText = `
        width: 44px; height: 44px; border-radius: 50%; background: #e2e8f0;
        border: 3px solid #3fa2db;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 3px 12px rgba(0,0,0,0.25);
        transition: transform 0.2s; overflow: hidden;
      `;

      const img = document.createElement('img');
      img.alt = dest.name;
      img.style.cssText = `width: 100%; height: 100%; border-radius: 50%; object-fit: cover;`;
      img.src = dest.image || this.getPlaceholderDataUrl(dest.name[0]);

      this.markerBubbles.set(dest.id, img);
      bubble.appendChild(img);

      const label = document.createElement('div');
      label.style.cssText = `
        background: #1a1a2e; color: #fff; font-size: 10px; font-family: sans-serif;
        padding: 2px 7px; border-radius: 10px; margin-top: 4px; white-space: nowrap;
        font-weight: 600; letter-spacing: 0.3px;
      `;
      label.textContent = dest.name;

      pinEl.appendChild(bubble);
      pinEl.appendChild(label);

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: dest.lat, lng: dest.lng },
        map: this.map,
        title: dest.name,
        content: pinEl,
      });

      marker.addEventListener('gmp-click', () => {
        this.ngZone.run(() => this.selectDestination(dest));
      });

      this.markers.push(marker);
    });
  }

  private getPlaceholderDataUrl(letter: string): string {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44">
        <rect width="44" height="44" rx="22" fill="#cbd5e1"/>
        <text x="22" y="28" text-anchor="middle"
              font-family="sans-serif" font-size="18" font-weight="bold" fill="#64748b">
          ${letter.toUpperCase()}
        </text>
      </svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  // ─── Selección de destino ───────────────────────────────────────────────────

  async selectDestination(dest: Destination): Promise<void> {
    this.selectedDestination = dest;
    this.isDropdownOpen = false;
    this.activePhotoIndex = 0;

    // ✅ Garantizar thumbnail e imagen de galería inmediatamente con la imagen estática
    if (!dest.thumbnail) dest.thumbnail = dest.image;
    if (dest.photos.length === 0) dest.photos = [dest.image];

    if (this.map) {
      this.map.panTo({ lat: dest.lat, lng: dest.lng });
      this.map.setZoom(12);
    }

    this.highlightMarker(dest);

    if (!dest.photosLoaded) {
      this.isLoadingPhotos = true;
      await this.loadDestinationPhotos(dest);
      this.isLoadingPhotos = false;
    }
  }

  // ─── Places API: enriquece solo si responde; si falla usa imagen estática ──

  private async loadDestinationPhotos(dest: Destination): Promise<void> {
    try {
      const place = new google.maps.places.Place({ id: dest.placeId });
      await place.fetchFields({
        fields: ['photos', 'displayName', 'editorialSummary'],
      });

      const photos: string[] = [];
      if (place.photos?.length > 0) {
        place.photos.slice(0, 6).forEach((p: any) => {
          photos.push(p.getURI({ maxWidth: 800, maxHeight: 500 }));
        });
      }

      this.ngZone.run(() => {
        // ✅ Solo reemplaza si Places devolvió fotos reales
        if (photos.length > 0) {
          dest.photos = photos;
          dest.thumbnail = place.photos[0].getURI({
            maxWidth: 120,
            maxHeight: 120,
          });
          const imgEl = this.markerBubbles.get(dest.id);
          if (imgEl) imgEl.src = dest.thumbnail;
        }
        // Si Places no devuelve fotos, dest.photos conserva [dest.image] del paso anterior

        if (place.editorialSummary) dest.description = place.editorialSummary;
        dest.photosLoaded = true;
      });
    } catch {
      // ✅ Places bloqueado o sin respuesta: dest.photos ya tiene la imagen estática, no tocar nada
      this.ngZone.run(() => {
        dest.photosLoaded = true;
      });
    }
  }

  // ─── Resaltar marcador activo ───────────────────────────────────────────────

  highlightMarker(dest: Destination): void {
    this.markers.forEach((marker, i) => {
      const bubble = marker.content?.querySelector('div');
      if (bubble) {
        bubble.style.transform =
          this.destinations[i].id === dest.id ? 'scale(1.35)' : 'scale(1)';
        bubble.style.borderColor =
          this.destinations[i].id === dest.id ? '#b5e5ff' : '#7bdcff';
      }
    });
  }

  // ─── Controles ─────────────────────────────────────────────────────────────

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  prevPhoto(): void {
    if (this.selectedDestination && this.activePhotoIndex > 0)
      this.activePhotoIndex--;
  }

  nextPhoto(): void {
    if (
      this.selectedDestination &&
      this.activePhotoIndex < this.selectedDestination.photos.length - 1
    )
      this.activePhotoIndex++;
  }

  showAll(): void {
    if (this.map) {
      this.selectedDestination = null;
      this.map.panTo({ lat: 7.5, lng: -75.2 });
      this.map.setZoom(6);
      this.markers.forEach((marker) => {
        const bubble = marker.content?.querySelector('div');
        if (bubble) {
          bubble.style.transform = 'scale(1)';
          bubble.style.borderColor = '#3acaff';
        }
      });
    }
  }

  get totalDestinations(): number {
    return this.destinations.length;
  }

  ngOnDestroy(): void {
    this.markers.forEach((m) => (m.map = null));
    this.markerBubbles.clear();
  }
}