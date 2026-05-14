import { Component, Input, OnInit } from '@angular/core';
import { PackageDetail } from '../package-detail-sheet/package-detail-sheet.component';

export interface TravelPackage {
  id: number;
  name: string;
  location: string;
  price: number;
  imageUrl: string;
  rating: number;
  nights: number;
  category: string;
}

@Component({
  selector: 'app-packages-card',
  templateUrl: './packages-card.component.html',
  styleUrls: ['./packages-card.component.css'], // ← agrega esto
})
export class PackagesCardComponent implements OnInit {

  @Input() showAll: boolean = false;

  // ── Bottom sheet ──────────────────────────────
  sheetOpen = false;
  selectedPackageDetail: PackageDetail | null = null;

  allPackages: TravelPackage[] = [
    { id: 1, name: 'Piscilago', location: 'Vía Bogotá – Girardot', price: 400000, imageUrl: 'assets/images/piscilago.jpg', rating: 4.2, nights: 2, category: 'aventura' },
    { id: 2, name: 'Santa Marta', location: 'Santa Marta – Colombia', price: 700000, imageUrl: 'assets/images/santa-marta.jpg', rating: 4.5, nights: 4, category: 'playa' },
    { id: 3, name: 'Barranquilla', location: 'Barranquilla – Colombia', price: 550000, imageUrl: 'assets/images/barranquilla.jpg', rating: 4.0, nights: 3, category: 'cultura' },
    { id: 4, name: 'Cartagena', location: 'Cartagena – Colombia', price: 650000, imageUrl: 'assets/images/cartagena.jpg', rating: 4.2, nights: 3, category: 'playa' },
    { id: 5, name: 'Medellín', location: 'Guatapé – Colombia', price: 745000, imageUrl: 'assets/images/medellin.jpg', rating: 4.5, nights: 4, category: 'naturaleza' },
    { id: 6, name: 'Eje Cafetero', location: 'Quindío – Colombia', price: 480000, imageUrl: 'assets/images/eje-cafetero.jpg', rating: 4.3, nights: 3, category: 'naturaleza' }
  ];

  displayedPackages: TravelPackage[] = [];
  likedPackages: Set<number> = new Set();

  ngOnInit(): void {
    this.displayedPackages = this.showAll
      ? this.allPackages
      : this.allPackages.slice(0, 6);
  }

  // ── Abre el sheet con el paquete clickeado ────
  openDetail(pkg: TravelPackage): void {
    this.selectedPackageDetail = this.mapToDetail(pkg);
    this.sheetOpen = true;
  }

  closeDetail(): void {
    this.sheetOpen = false;
  }

  // ── Mapea TravelPackage → PackageDetail ───────
  private mapToDetail(pkg: TravelPackage): PackageDetail {
    return {
      title: pkg.name,
      subtitle: `Disfruta ${pkg.nights} noches increíbles en ${pkg.location}.`,
      spotsAvailable: 30,
      price: pkg.price,
      destinations: pkg.location,
      duration: `${pkg.nights + 1} Días / ${pkg.nights} Noches`,
      departurePlace: 'Calarcá, Quindío – Barrio el Cacique',
      date: '17/03/2025 – 6:00 AM',
      accommodation: 'Hotel 3 estrellas o similar. Habitación múltiple (compartida)',
      transport: 'Bus de turismo',
      itinerary: [
        { day: 'Día 1:', desc: 'Salida y llegada al primer destino' },
        { day: 'Día 2:', desc: `Tour por ${pkg.name} y actividades` },
        { day: 'Día 3:', desc: 'Día libre para explorar' },
      ],
      includes: ['Transporte', 'Hotel', 'Alimentación', 'Tours Guiados', 'Integraciones'],
      notIncludes: ['Gastos personales', 'Bebidas alcohólicas', 'Servicios adicionales'],
      cancellation: [
        'Cancelación gratuita hasta 5 días antes',
        '50% de reembolso hasta 48 horas antes',
        'No hay reembolso el mismo día',
      ]
    };
  }

  toggleLike(id: number, event: Event): void {
    event.stopPropagation();
    this.likedPackages.has(id)
      ? this.likedPackages.delete(id)
      : this.likedPackages.add(id);
  }

  isLiked(id: number): boolean {
    return this.likedPackages.has(id);
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://placehold.co/400x200/0077b6/white?text=Sin+imagen';
    img.onerror = null;
  }
}