import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { OperacionesService } from '../../core/services/operaciones.service';
import { PackageService } from '../../core/services/package.service';
import { Viaje } from '../../features/panel-admin/models/operaciones.models';
import { RespuestaPaqueteTuristico } from '../../features/panel-admin/models/package.model';
import { mapToPackageDetail } from '../utils/package-mapper';
import { PackageDetail } from '../package-detail-sheet/package-detail-sheet.component';

@Component({
  selector: 'app-next-trip-banner',
  templateUrl: './next-trip-banner.component.html',
  styleUrls: ['./next-trip-banner.component.css'],
})
export class NextTripBannerComponent implements OnInit {

  @Output() openPackageDetail = new EventEmitter<PackageDetail>();

  proximoViaje: Viaje | null = null;
  paquete: RespuestaPaqueteTuristico | null = null;
  cargando = true;

  constructor(
    private operacionesService: OperacionesService,
    private packageService: PackageService,
  ) {}

  ngOnInit(): void {
    this.cargarProximoViaje();
  }

  private cargarProximoViaje(): void {
    this.cargando = true;
    this.operacionesService.getViajes().subscribe({
      next: (viajes) => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const futuros = viajes
          .filter(v => {
            const fecha = new Date(v.fechaSalida);
            return fecha >= hoy && v.estado !== 'CANCELADO' && v.estado !== 'FINALIZADO';
          })
          .sort((a, b) => new Date(a.fechaSalida).getTime() - new Date(b.fechaSalida).getTime());

        if (futuros.length === 0) {
          this.cargando = false;
          return;
        }

        this.proximoViaje = futuros[0];
        this.cargarPaquete(this.proximoViaje.idPaquete);
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  private cargarPaquete(idPaquete: number): void {
    this.packageService.getPackageById(idPaquete).subscribe({
      next: (paquete) => {
        this.paquete = paquete;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  get fechaFormateada(): string {
    if (!this.proximoViaje?.fechaSalida) return '—';
    const fecha = new Date(this.proximoViaje.fechaSalida);
    return fecha.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  get destino(): string {
    if (this.paquete?.destinos?.length) return this.paquete.destinos.join(', ');
    return this.paquete?.destino || this.paquete?.titulo || 'Próximo destino';
  }

  onVerMasInfo(): void {
    if (!this.paquete) return;
    this.openPackageDetail.emit(mapToPackageDetail(this.paquete));
  }
}
