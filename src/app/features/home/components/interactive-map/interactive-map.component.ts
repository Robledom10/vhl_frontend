import { Component, OnInit, OnDestroy } from '@angular/core';

declare var google: any;

interface Place {
  name: string;
  description: string;
  address: string;
  thumbnail: string;
  photos: string[];
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-interactive-map',
  templateUrl: './interactive-map.component.html',
  styleUrls: ['./interactive-map.component.css'],
})
export class InteractiveMapComponent implements OnInit, OnDestroy {
  private map: any;
  private currentMarker: any = null;

  searchQuery: string = '';
  searchResults: Place[] = [];
  selectedPlace: Place | null = null;

  defaultLocation = { lat: 4.449, lng: -75.6443 };
  defaultAddress = 'Cra. 25 # 41-61, Calarcá, Quindío';

  allPlaces: Place[] = [
    {
      name: 'Piscilago',
      description:
        'Parque acuático y natural ideal para disfrutar en familia, con piscinas, atracciones y zonas verdes.',
      address: 'Km 105 Vía Bogotá – Girardot, Melgar, Tolima, Colombia',
      thumbnail:
        'https://images.unsplash.com/photo-1582655008695-f3d1371d1b8a?w=80&h=80&fit=crop',
      photos: [
        'https://images.unsplash.com/photo-1582655008695-f3d1371d1b8a?w=200&h=140&fit=crop',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200&h=140&fit=crop',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=200&h=140&fit=crop',
      ],
      lat: 4.2081,
      lng: -74.6367,
    },
    {
      name: 'Cartagena',
      description:
        'Ciudad histórica amurallada con playas paradisíacas y arquitectura colonial en el Caribe colombiano.',
      address: 'Cartagena de Indias, Bolívar, Colombia',
      thumbnail:
        'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=80&h=80&fit=crop',
      photos: [
        'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=200&h=140&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=140&fit=crop',
        'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=200&h=140&fit=crop',
      ],
      lat: 10.391,
      lng: -75.4794,
    },
    {
      name: 'Medellín',
      description:
        'Ciudad de la eterna primavera con innovación urbana, cultura vibrante y naturaleza exuberante.',
      address: 'Medellín, Antioquia, Colombia',
      thumbnail:
        'https://images.unsplash.com/photo-1598135753163-6167c1a1ad65?w=80&h=80&fit=crop',
      photos: [
        'https://images.unsplash.com/photo-1598135753163-6167c1a1ad65?w=200&h=140&fit=crop',
        'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=200&h=140&fit=crop',
        'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=200&h=140&fit=crop',
      ],
      lat: 6.2442,
      lng: -75.5812,
    },
    {
      name: 'San Andrés',
      description:
        'Isla paradisíaca con aguas cristalinas turquesas, arrecifes de coral y ambiente caribeño único.',
      address: 'San Andrés, Archipiélago de San Andrés, Colombia',
      thumbnail:
        'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=80&h=80&fit=crop',
      photos: [
        'https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=200&h=140&fit=crop',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&h=140&fit=crop',
        'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=200&h=140&fit=crop',
      ],
      lat: 12.5847,
      lng: -81.7006,
    },
    {
      name: 'Bogotá',
      description:
        'Capital de Colombia, ciudad cosmopolita con museos de clase mundial, gastronomía y vida nocturna.',
      address: 'Bogotá D.C., Colombia',
      thumbnail:
        'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=80&h=80&fit=crop',
      photos: [
        'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=200&h=140&fit=crop',
        'https://images.unsplash.com/photo-1531219432768-9f540ce91ef3?w=200&h=140&fit=crop',
        'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=200&h=140&fit=crop',
      ],
      lat: 4.711,
      lng: -74.0721,
    },
  ];
  getMapStyles(): any[] {
    return [
      // Base tierra
      { elementType: 'geometry', stylers: [{ color: '#eef6fb' }] },

      // Agua azul medio, protagonista pero no agresivo
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#3fa2db' }, { lightness: 40 }],
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#123862' }],
      },

      // Tierra con tono crema azulado
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ color: '#f0f8ff' }],
      },
      {
        featureType: 'landscape.natural',
        elementType: 'geometry',
        stylers: [{ color: '#e8f4f9' }],
      },
      {
        featureType: 'landscape.man_made',
        elementType: 'geometry',
        stylers: [{ color: '#f4fafd' }],
      },

      // Sin rutas ni POI
      { featureType: 'road', stylers: [{ visibility: 'off' }] },
      { featureType: 'poi', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', stylers: [{ visibility: 'off' }] },

      // Bordes de países elegantes
      {
        featureType: 'administrative.country',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#3fa2db' }, { weight: 1.2 }, { lightness: 30 }],
      },

      // Bordes de provincias/departamentos suaves
      {
        featureType: 'administrative.province',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#b5e5ff' }, { weight: 0.8 }],
      },

      // Etiquetas países
      {
        featureType: 'administrative.country',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#123862' }],
      },
      {
        featureType: 'administrative.country',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#ffffff' }, { weight: 3 }],
      },

      // Etiquetas ciudades
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#3fa2db' }],
      },
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#ffffff' }, { weight: 2 }],
      },
      {
        featureType: 'administrative.locality',
        elementType: 'labels.icon',
        stylers: [{ visibility: 'off' }],
      },
    ];
  }
  ngOnInit(): void {
    this.loadGoogleMaps();
  }

  loadGoogleMaps(): void {
    if (typeof google !== 'undefined' && google.maps?.Map) {
      this.initMap();
      return;
    }
    (window as any)['initMapCallback'] = () => this.initMap();
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCChhbt5C8uOtQrdF6lFwEYaHxbtuFcNmE&libraries=marker&callback=initMapCallback`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  initMap(): void {
    this.map = new google.maps.Map(document.getElementById('travel-map'), {
      center: this.defaultLocation,
      zoom: 15,
      minZoom: 6,
      maxZoom: 18,
      mapId: 'DEMO_MAP_ID',
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      restriction: {
        latLngBounds: {
          north: 13.5,
          south: -4.5,
          west: -79.5,
          east: -66.5,
        },
        strictBounds: true,
      },
    });

    this.addDefaultPin();
  }

  addDefaultPin(): void {
    const pinEl = document.createElement('div');
    pinEl.style.cssText = `
      width: 20px;
      height: 20px;
      background: #fff;
      border: 3px solid #1a8fff;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(26,143,255,0.5);
    `;

    const marker = new google.maps.marker.AdvancedMarkerElement({
      position: this.defaultLocation,
      map: this.map,
      title: this.defaultAddress,
      content: pinEl,
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="font-family:sans-serif; padding:4px 2px;">
          <strong style="color:#1a5fa8; font-size:0.85rem;">📍 ${this.defaultAddress}</strong>
        </div>
      `,
    });

    infoWindow.open(this.map, marker);
    marker.addListener('click', () => infoWindow.open(this.map, marker));
  }

  onSearch(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.searchResults = [];
      this.selectedPlace = null;
      return;
    }
    this.searchResults = this.allPlaces.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q),
    );
  }

  selectPlace(place: Place): void {
    this.selectedPlace = place;
    if (this.map) {
      this.map.panTo({ lat: place.lat, lng: place.lng });
      this.map.setZoom(13);
      this.addSelectedMarker(place);
    }
  }

  addSelectedMarker(place: Place): void {
    if (this.currentMarker) {
      this.currentMarker.map = null;
    }
    const pinEl = document.createElement('div');
    pinEl.style.cssText = `
      width: 20px;
      height: 20px;
      background: #fff;
      border: 3px solid #1a8fff;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(26,143,255,0.4);
    `;
    this.currentMarker = new google.maps.marker.AdvancedMarkerElement({
      position: { lat: place.lat, lng: place.lng },
      map: this.map,
      title: place.name,
      content: pinEl,
    });
  }

  ngOnDestroy(): void {
    if (this.currentMarker) {
      this.currentMarker.map = null;
    }
  }
}
