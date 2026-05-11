import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';

declare var google: any;

interface Place {
  name: string;
  description: string;
  address: string;
  thumbnail: string;
  photos: string[];
  lat: number;
  lng: number;
  placeId?: string;
}

@Component({
  selector: 'app-interactive-map',
  templateUrl: './interactive-map.component.html',
  styleUrl: './interactive-map.component.css',
})
export class InteractiveMapComponent implements OnInit, OnDestroy {
  private map: any;
  private currentMarker: any = null;
  private previewMarker: any = null;
  private mapsReady = false;
  private pendingSearch = '';

  searchQuery: string = '';
  searchResults: Place[] = [];
  selectedPlace: Place | null = null;
  isLoading: boolean = false;

  defaultLocation = { lat: 4.528823583221963, lng: -75.64157122965305 };
  defaultAddress = 'Cra. 25 # 41-61, Calarcá, Quindío';
  defaultPinImageUrl =
    'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=80&h=80&fit=crop';

  private colombiaBounds = {
    north: 13.5,
    south: -4.5,
    west: -79.5,
    east: -66.5,
  };

  constructor(private ngZone: NgZone) {}

  ngOnInit(): void {
    this.loadGoogleMaps();
  }

  // ─── Carga del SDK ────────────────────────────────────────────────────────

  loadGoogleMaps(): void {
    if (typeof google !== 'undefined' && google.maps?.Map) {
      this.initMap();
      return;
    }
    (window as any)['initMapCallback'] = () => this.ngZone.run(() => this.initMap());
    const script = document.createElement('script');
    // ✅ loading=async requerido por la nueva API
    script.src =
      'https://maps.googleapis.com/maps/api/js?key=AIzaSyCChhbt5C8uOtQrdF6lFwEYaHxbtuFcNmE&libraries=marker,places&loading=async&callback=initMapCallback';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  initMap(): void {
    this.map = new google.maps.Map(document.getElementById('travel-map'), {
      center: { lat: 4.5709, lng: -74.2973 },
      zoom: 6,
      minZoom: 5,
      maxZoom: 18,
      mapId: 'DEMO_MAP_ID',
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      restriction: {
        latLngBounds: this.colombiaBounds,
        strictBounds: true,
      },
    });

    this.mapsReady = true;
    this.addDefaultPin();

    if (this.pendingSearch) {
      const q = this.pendingSearch;
      this.pendingSearch = '';
      this.searchQuery = q;
      this.runSearch(q);
    }
  }

  // ─── Pin por defecto ──────────────────────────────────────────────────────

  addDefaultPin(): void {
    const pinEl = document.createElement('div');
    pinEl.style.cssText = `
      width: 60px; height: 60px; border-radius: 50%; overflow: hidden;
      border: 3px solid #1a8fff; box-shadow: 0 2px 12px rgba(26,143,255,0.55); cursor: pointer;
    `;
    const img = document.createElement('img');
    img.src = this.defaultPinImageUrl;
    img.alt = this.defaultAddress;
    img.style.cssText = `width:100%;height:100%;object-fit:cover;display:block;`;
    pinEl.appendChild(img);

    const marker = new google.maps.marker.AdvancedMarkerElement({
      position: this.defaultLocation,
      map: this.map,
      title: this.defaultAddress,
      content: pinEl,
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `<div style="font-family:sans-serif;padding:4px 2px;">
        <strong style="color:#1a5fa8;font-size:0.85rem;">📍 ${this.defaultAddress}</strong>
      </div>`,
    });
    infoWindow.open(this.map, marker);
    // ✅ nueva API usa gmp-click
    marker.addEventListener('gmp-click', () => infoWindow.open(this.map, marker));
  }

  // ─── Búsqueda pública ─────────────────────────────────────────────────────

  onSearch(): void {
    const q = this.searchQuery.trim();
    if (!q) {
      this.searchResults = [];
      this.selectedPlace = null;
      return;
    }
    if (!this.mapsReady) {
      this.pendingSearch = q;
      return;
    }
    this.runSearch(q);
  }

  // ─── Nueva API: AutocompleteSuggestion + Place ────────────────────────────

  private async runSearch(q: string): Promise<void> {
    this.isLoading = true;
    this.searchResults = [];

    try {
      // ✅ Nueva API: AutocompleteSuggestion (reemplaza AutocompleteService)
      const { suggestions } =
        await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: q,
          includedRegionCodes: ['co'], // ✅ Solo Colombia
        });

      if (!suggestions?.length) {
        this.ngZone.run(() => {
          this.isLoading = false;
          this.searchResults = [];
        });
        return;
      }

      const top5 = suggestions.slice(0, 5);

      const results = await Promise.all(
        top5.map(async (suggestion: any) => {
          try {
            // ✅ Nueva API: Place (reemplaza PlacesService.getDetails)
            const place = suggestion.placePrediction.toPlace();
            await place.fetchFields({
              fields: [
                'displayName',
                'formattedAddress',
                'location',
                'photos',
                'editorialSummary',
                'id',
              ],
            });

            const lat = place.location.lat();
            const lng = place.location.lng();

            // Verificar dentro de Colombia
            if (
              lat < this.colombiaBounds.south ||
              lat > this.colombiaBounds.north ||
              lng < this.colombiaBounds.west ||
              lng > this.colombiaBounds.east
            ) return null;

            // ✅ Fotos con la nueva API
            const photos: string[] = [];
            if (place.photos?.length > 0) {
              place.photos.slice(0, 3).forEach((p: any) => {
                photos.push(
                  p.getURI({ maxWidth: 400, maxHeight: 280 })
                );
              });
            }

            const thumbnail =
              photos.length > 0
                ? place.photos[0].getURI({ maxWidth: 120, maxHeight: 120 })
                : 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=120&h=120&fit=crop';

            return {
              name: place.displayName || '',
              description: place.editorialSummary || place.formattedAddress || '',
              address: place.formattedAddress || '',
              thumbnail,
              photos,
              lat,
              lng,
              placeId: place.id,
            } as Place;
          } catch {
            return null;
          }
        })
      );

      this.ngZone.run(() => {
        this.isLoading = false;
        this.searchResults = results.filter((r): r is Place => r !== null);
      });
    } catch (err) {
      console.error('Places error:', err);
      this.ngZone.run(() => {
        this.isLoading = false;
        this.searchResults = [];
      });
    }
  }

  // ─── Seleccionar lugar ────────────────────────────────────────────────────

  selectPlace(place: Place): void {
    this.selectedPlace = place;
    if (this.map) {
      this.map.panTo({ lat: place.lat, lng: place.lng });
      this.map.setZoom(13);
      this.addSelectedMarker(place);
    }
  }

  // ─── Marker: tarjeta rectangular (imagen arriba + dirección abajo) ─────────

  addSelectedMarker(place: Place): void {
    if (this.currentMarker) this.currentMarker.map = null;
    if (this.previewMarker) this.previewMarker.map = null;

    // Punto azul en la coordenada exacta
    const pinEl = document.createElement('div');
    pinEl.style.cssText = `
      width: 14px; height: 14px;
      background: #1a8fff; border: 3px solid #fff; border-radius: 50%;
      box-shadow: 0 2px 10px rgba(26,143,255,0.8);
    `;
    this.currentMarker = new google.maps.marker.AdvancedMarkerElement({
      position: { lat: place.lat, lng: place.lng },
      map: this.map,
      content: pinEl,
    });

    // Tarjeta flotante
    const photoUrl =
      place.photos.length > 0
        ? place.photos[0]
        : 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=220&h=130&fit=crop';

    const previewEl = document.createElement('div');
    previewEl.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translateY(calc(-100% - 20px));
      pointer-events: none;
    `;

    previewEl.innerHTML = `
      <div style="
        background:#fff; border-radius:12px; overflow:hidden; width:210px;
        box-shadow:0 8px 28px rgba(0,0,0,0.22); border:1.5px solid #ddeeff;
      ">
        <img
          src="${photoUrl}"
          alt="${place.name}"
          style="width:210px;height:120px;object-fit:cover;display:block;"
          onerror="this.src='https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=210&h=120&fit=crop'"
        />
        <div style="padding:8px 10px 10px;font-family:'Segoe UI',Arial,sans-serif;">
          <div style="font-size:12.5px;font-weight:700;color:#1a3a5c;margin-bottom:3px;
            white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            ${place.name}
          </div>
          <div style="font-size:10.5px;color:#7a8fa8;
            white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            <span style="color:#1a8fff;">📍</span> ${place.address}
          </div>
        </div>
      </div>
      <div style="
        width:0; height:0;
        border-left:9px solid transparent; border-right:9px solid transparent;
        border-top:11px solid #fff;
        filter:drop-shadow(0 2px 2px rgba(0,0,0,0.12));
        margin-top:-1px;
      "></div>
    `;

    this.previewMarker = new google.maps.marker.AdvancedMarkerElement({
      position: { lat: place.lat, lng: place.lng },
      map: this.map,
      content: previewEl,
    });
  }

  ngOnDestroy(): void {
    if (this.currentMarker) this.currentMarker.map = null;
    if (this.previewMarker) this.previewMarker.map = null;
  }
}