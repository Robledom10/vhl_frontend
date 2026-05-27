import { Component } from '@angular/core';
import { PackageDetail } from '../../../../shared/package-detail-sheet/package-detail-sheet.component';
import { AdminPackage } from './models/packages.model';

@Component({
  selector: 'app-packages',
  templateUrl: './packages.component.html',
  styleUrl: './packages.component.css',
})
export class PackagesComponent {
  // Modal de from de creación de paquetes
  showCreateModal = false;

  openCreateModal() {
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  // Bottom sheet
  sheetOpen = false;
  selectedPackageDetail: PackageDetail | null = null;

  showDeleteModal = false;

  showToast = false;

  selectedPackage: AdminPackage | null = null;

  packages: AdminPackage[] = [
    {
      imageUrl: 'https://picsum.photos/200?1',
      name: 'Tour Medellín',
      location: 'Medellín',
      duration: '4 días',
      date: '15/07/2026',
      price: 8500,
      capacity: 40,
      status: 'activo',
    },
    {
      imageUrl: 'https://picsum.photos/200?2',
      name: 'Tour Cartagena',
      location: 'Cartagena',
      duration: '5 días',
      date: '20/08/2026',
      price: 1200000,
      capacity: 25,
      status: 'activo',
    },
  ];

  openDetail(pkg: AdminPackage): void {
    this.selectedPackageDetail = this.mapToDetail(pkg);
    this.sheetOpen = true;
  }

  closeDetail(): void {
    this.sheetOpen = false;
  }

  private mapToDetail(pkg: AdminPackage): PackageDetail {
    return {
      title: pkg.name,
      subtitle: `Disfruta una experiencia increíble en ${pkg.location}.`,
      spotsAvailable: pkg.capacity,
      price: Number(pkg.price.toString().replace(/\./g, '')),
      destinations: pkg.location,
      duration: pkg.duration,
      departurePlace: 'Calarcá, Quindío - Barrio el Cacique',
      date: pkg.date,
      accommodation: 'Hotel incluido',
      transport: 'Bus de turismo',
      mainImage: pkg.imageUrl,
      galleryImages: [],
      itinerary: [
        {
          day: 'Día 1',
          desc: 'Salida y llegada al destino',
        },
        {
          day: 'Día 2',
          desc: 'Actividades y recorridos turísticos',
        },
      ],
      includes: ['Transporte', 'Hospedaje', 'Tours'],
      notIncludes: ['Gastos personales'],
      cancellation: ['Cancelación gratuita hasta 5 días antes'],
	  requirements: ['Documento de identidad', 'Pago completo antes del viaje'],
    };
  }

  // Modal de confirmación
  openDeleteModal(pkg: AdminPackage): void {
    this.selectedPackage = pkg;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (!this.selectedPackage) return;

    this.selectedPackage.status = 'inactivo';

    this.showDeleteModal = false;

    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
