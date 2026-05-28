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
  private mapsReady = false;
  private markers: any[] = [];
  private routePolyline: any = null;
  private infoWindows: any[] = [];

  isDropdownOpen = false;
  selectedDestination: Destination | null = null;
  isLoadingPhotos = false;
  activePhotoIndex = 0;

  destinations: Destination[] = [
    {
      id: 'calarca',
      name: 'Calarcá',
      label: 'Calarcá, Quindío, Colombia',
      image: 'https://res.cloudinary.com/dqcviyp18/image/upload/q_auto/f_auto/v1779948930/Quindio_b3feaf.jpg',
      description: 'Punto de partida. Un municipio cafetero rodeado de paisajes naturales y cercano al Valle del Cocora.',
      lat: 4.5297,
      lng: -75.6406,
      placeId: 'ChIJx8bT4x7Koo8R7x4X0sJfR5M',
      photos: [],
      thumbnail: '',
      photosLoaded: false,
    },
    {
      id: 'santamarta',
      name: 'Santa Marta',
      label: 'Magdalena, Colombia',
      image: '🏖️',
      description: 'La ciudad más antigua de Colombia. Playas paradisíacas, la Sierra Nevada y el Parque Tayrona.',
      lat: 11.2408,
      lng: -74.2110,
      placeId: 'ChIJRcbVhzJa-o4Rz5GJkFDZ1uE',
      photos: [],
      thumbnail: '',
      photosLoaded: false,
    },
    {
      id: 'cartagena',
      name: 'Cartagena',
      label: 'Bolívar, Colombia',
      image: '🏰',
      description: 'Ciudad amurallada Patrimonio de la Humanidad. Historia colonial, islas del Rosario y playas del Caribe.',
      lat: 10.3910,
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
      image: '🎉',
      description: 'La capital de la alegría. Sede del famoso Carnaval declarado Patrimonio Inmaterial de la Humanidad.',
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
      image: '🌸',
      description: 'La ciudad de la eterna primavera. Innovación, cultura, flores y la calidez de su gente paisa.',
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

  // ─── Carga del SDK ─────────────────────────────────────────────────────────

  loadGoogleMaps(): void {
    if (typeof google !== 'undefined' && google.maps?.Map) {
      this.initMap();
      return;
    }
    (window as any)['initMapCallback'] = () => this.ngZone.run(() => this.initMap());
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

    this.mapsReady = true;
    this.addRouteToMap();
    this.loadAllThumbnails();
  }

  // ─── Ruta y marcadores en el mapa ─────────────────────────────────────────

  addRouteToMap(): void {
    const routeCoords = this.destinations.map(d => ({ lat: d.lat, lng: d.lng }));

    this.routePolyline = new google.maps.Polyline({
      path: routeCoords,
      geodesic: true,
      strokeColor: '#3fa2db',
      strokeOpacity: 0.85,
      strokeWeight: 3,
      icons: [{
        icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 4, fillColor: '#3fa2db', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 1 },
        offset: '100%',
        repeat: '120px',
      }],
    });
    this.routePolyline.setMap(this.map);

    this.destinations.forEach((dest, index) => {
      const pinEl = document.createElement('div');
      pinEl.style.cssText = `
        display: flex; flex-direction: column; align-items: center; cursor: pointer;
      `;
      const bubble = document.createElement('div');
      bubble.style.cssText = `
        width: 38px; height: 38px; border-radius: 50%; background: #fff;
        border: 3px solid ${index === 0 ? '#10B981' : '#3fa2db'};
        display: flex; align-items: center; justify-content: center;
        font-size: 18px; box-shadow: 0 3px 12px rgba(0,0,0,0.25);
        transition: transform 0.2s;
      `;
      bubble.innerHTML = `
  <img 
    src="${dest.image}" 
    alt="${dest.name}"
    style="
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    "
  >
`;
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

  // ─── Cargar miniaturas de la API para todos los destinos ──────────────────

  async loadAllThumbnails(): Promise<void> {
    for (const dest of this.destinations) {
      try {
        const place = new google.maps.places.Place({ id: dest.placeId });
        await place.fetchFields({ fields: ['photos', 'displayName'] });
        if (place.photos?.length > 0) {
          dest.thumbnail = place.photos[0].getURI({ maxWidth: 120, maxHeight: 120 });
        }
      } catch {
        dest.thumbnail = '';
      }
    }
  }

  // ─── Selección de destino ─────────────────────────────────────────────────

  async selectDestination(dest: Destination): Promise<void> {
    this.selectedDestination = dest;
    this.isDropdownOpen = false;
    this.activePhotoIndex = 0;

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

  private async loadDestinationPhotos(dest: Destination): Promise<void> {
    try {
      const place = new google.maps.places.Place({ id: dest.placeId });
      await place.fetchFields({
        fields: ['photos', 'displayName', 'editorialSummary', 'formattedAddress'],
      });

      const photos: string[] = [];
      if (place.photos?.length > 0) {
        place.photos.slice(0, 6).forEach((p: any) => {
          photos.push(p.getURI({ maxWidth: 800, maxHeight: 500 }));
        });
      }

      this.ngZone.run(() => {
        dest.photos = photos;
        dest.photosLoaded = true;
        if (photos.length > 0) dest.thumbnail = place.photos[0].getURI({ maxWidth: 120, maxHeight: 120 });
        if (place.editorialSummary) dest.description = place.editorialSummary;
      });
    } catch (err) {
      console.error('Error cargando fotos:', err);
      this.ngZone.run(() => { dest.photosLoaded = true; });
    }
  }

  // ─── Resaltar marcador activo ─────────────────────────────────────────────

  highlightMarker(dest: Destination): void {
    this.markers.forEach((marker, i) => {
      const bubble = marker.content?.querySelector('div');
      if (bubble) {
        bubble.style.transform = this.destinations[i].id === dest.id ? 'scale(1.35)' : 'scale(1)';
        bubble.style.borderColor = this.destinations[i].id === dest.id ? '#7C3AED' : (i === 0 ? '#10B981' : '#FF6B35');
      }
    });
  }

  // ─── Controles del dropdown ───────────────────────────────────────────────

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  prevPhoto(): void {
    if (this.selectedDestination && this.activePhotoIndex > 0) {
      this.activePhotoIndex--;
    }
  }

  nextPhoto(): void {
    if (this.selectedDestination && this.activePhotoIndex < this.selectedDestination.photos.length - 1) {
      this.activePhotoIndex++;
    }
  }

  showAll(): void {
    if (this.map) {
      this.selectedDestination = null;
      this.map.panTo({ lat: 7.5, lng: -75.2 });
      this.map.setZoom(6);
      this.markers.forEach((marker, i) => {
        const bubble = marker.content?.querySelector('div');
        if (bubble) {
          bubble.style.transform = 'scale(1)';
          bubble.style.borderColor = i === 0 ? '#10B981' : '#FF6B35';
        }
      });
    }
  }

  get totalDestinations(): number {
    return this.destinations.length;
  }

  ngOnDestroy(): void {
    this.markers.forEach(m => m.map = null);
    if (this.routePolyline) this.routePolyline.setMap(null);
  }
}