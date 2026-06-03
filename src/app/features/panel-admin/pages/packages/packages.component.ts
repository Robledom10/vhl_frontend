import { Component, OnInit } from '@angular/core';
import { PackageDetail } from '../../../../shared/package-detail-sheet/package-detail-sheet.component';
import { AdminPackage } from './models/packages.model';
import { PackageService } from '../../../../core/services/package.service';
import { RespuestaPaqueteTuristico, PageResponse } from '../../models/package.model';

@Component({
  selector: 'app-packages',
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.css'],
})
export class PackagesComponent implements OnInit {

  showCreateModal = false;
  showFilters = true;
  showFilterCalendar = false;
  sheetOpen = false;
  selectedPackageDetail: PackageDetail | null = null;
  showDeleteModal = false;
  showToast = false;
  toastTitle = '';
  toastMessage = '';
  toastType: 'success' | 'edit' | 'delete' = 'success';
  selectedPackage: AdminPackage | null = null;
  editingPackage: RespuestaPaqueteTuristico | null = null;
  packages: AdminPackage[] = [];
  busqueda = '';
  destinoFiltro = '';
  duracionFiltro: number | null = null;
  fechaSalidaFiltro = '';
  estadoFiltro = 'Activos';
  cargando = false;
  private filterChangeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private packageService: PackageService) {}

  ngOnInit(): void {
    this.cargarPaquetes();
  }

  openEditModal(pkg: AdminPackage): void {
    this.editingPackage = pkg.source;
    this.showCreateModal = true;
    document.body.style.overflow = 'hidden';
  }

  openCreateModal(): void {
    this.editingPackage = null;
    this.showCreateModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeCreateModal(): void {
    this.editingPackage = null;
    this.showCreateModal = false;
    document.body.style.overflow = '';
  }

  handlePackageSaved(event: { action: 'created' | 'updated'; name: string }): void {
    if (event.action === 'created') {
      this.showFeedbackToast(
        'Paquete creado con éxito',
        `El paquete "${event.name}" ya está disponible en la lista.`,
        'success',
      );
    } else {
      this.showFeedbackToast(
        'Paquete actualizado',
        `Los cambios de "${event.name}" se guardaron correctamente.`,
        'edit',
      );
    }

    this.cargarPaquetes();
  }

  private showFeedbackToast(title: string, message: string, type: 'success' | 'edit' | 'delete'): void {
    this.toastTitle = title;
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => { this.showToast = false; }, 3200);
  }

  cargarPaquetes(): void {
    this.cargando = true;
    this.packageService.getPackages({
      busqueda: this.busqueda || undefined,
      destino: this.destinoFiltro || undefined,
      duracionDias: this.duracionFiltro || undefined,
      fechaInicio: this.fechaSalidaFiltro || undefined,
      activo: this.estadoFiltro === 'Activos' ? true : this.estadoFiltro === 'Inactivos' ? false : undefined,
    }).subscribe({
      next: (page: PageResponse<RespuestaPaqueteTuristico>) => {
        this.packages = page.content.map((p: RespuestaPaqueteTuristico) => this.mapToAdminPackage(p));
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error cargando paquetes:', err);
        this.cargando = false;
      }
    });
  }

  buscar(): void {
    this.showFilterCalendar = false;
    this.cargarPaquetes();
  }

  autoApplyFilters(delay = 300): void {
    if (this.filterChangeTimer) {
      clearTimeout(this.filterChangeTimer);
    }

    this.filterChangeTimer = setTimeout(() => {
      this.showFilterCalendar = false;
      this.cargarPaquetes();
    }, delay);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  selectEstado(estado: string): void {
    this.estadoFiltro = estado;
    this.showFilters = false;
    this.cargarPaquetes();
  }

  clearFilters(): void {
    if (this.filterChangeTimer) {
      clearTimeout(this.filterChangeTimer);
      this.filterChangeTimer = null;
    }

    this.busqueda = '';
    this.destinoFiltro = '';
    this.duracionFiltro = null;
    this.fechaSalidaFiltro = '';
    this.showFilterCalendar = false;
    this.estadoFiltro = 'Activos';
    this.cargarPaquetes();
  }

  toggleFilterCalendar(event: Event): void {
    event.stopPropagation();
    this.showFilterCalendar = !this.showFilterCalendar;
  }

  onFilterDateSelected(date: string): void {
    this.fechaSalidaFiltro = date;
    this.showFilterCalendar = false;
    this.autoApplyFilters(0);
  }

  get formattedFilterDate(): string {
    if (!this.fechaSalidaFiltro) return 'dd / mm / aaaa';

    const [year, month, day] = this.fechaSalidaFiltro.split('-');
    return `${day}/${month}/${year}`;
  }

  private mapToAdminPackage(p: RespuestaPaqueteTuristico): AdminPackage {
    return {
      id: p.id,
      name: p.titulo,
      location: p.destino,
      duration: `${p.duracionDias} días`,
      date: p.fechaInicio,
      price: p.precio,
      capacity: p.cupo,
      status: p.activo ? 'activo' : 'inactivo',
      imageUrl: p.fotoVerticalUrl || p.fotoHorizontalUrl || 'https://picsum.photos/200',
      source: p,
    };
  }

  openDetail(pkg: AdminPackage): void {
    this.selectedPackageDetail = this.mapToPackageDetail(pkg.source);
    this.sheetOpen = true;
  }

  private mapToPackageDetail(p: RespuestaPaqueteTuristico): PackageDetail {
    return {
      title: p.titulo,
      subtitle: p.descripcion || '',
      spotsAvailable: p.cupo,
      price: p.precio,
      destinations: p.destino,
      duration: `${p.duracionDias} días`,
      departurePlace: p.lugarSalida,
      date: p.fechaInicio,
      accommodation: p.alojamiento,
      transport: p.tipoTransporte,
      mainImage: p.fotoVerticalUrl || p.fotoHorizontalUrl,
      galleryImages: p.fotoHorizontalUrl ? [p.fotoHorizontalUrl] : [],
      itinerary: (p.itinerario || []).map((i: any) => ({ day: `Día ${i.numeroDia}`, desc: i.titulo })),
      includes: p.incluye || [],
      notIncludes: p.noIncluye || [],
      cancellation: p.politicasCancelacion || [],
      requirements: p.requisitos || [],
    };
  }

  closeDetail(): void {
    this.sheetOpen = false;
  }

  openDeleteModal(pkg: AdminPackage): void {
    this.selectedPackage = pkg;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  get isSelectedInactive(): boolean {
    return this.selectedPackage?.status === 'inactivo';
  }

  confirmDelete(): void {
    if (!this.selectedPackage) return;
    const deletedName = this.selectedPackage.name;
    const isInactive = this.selectedPackage.status === 'inactivo';
    const delete$ = isInactive
      ? this.packageService.deletePackagePermanent(this.selectedPackage.id)
      : this.packageService.deletePackage(this.selectedPackage.id);

    delete$.subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.showFeedbackToast(
          isInactive ? 'Paquete eliminado definitivamente' : 'Paquete movido a inactivos',
          isInactive ? `"${deletedName}" fue eliminado permanentemente.` : `"${deletedName}" ya no aparece entre los paquetes activos.`,
          'delete',
        );
        this.packages = this.packages.filter(pkg => pkg.id !== this.selectedPackage?.id);
        this.cargarPaquetes();
      },
      error: (err: any) => console.error('Error eliminando paquete:', err)
    });
  }
}
