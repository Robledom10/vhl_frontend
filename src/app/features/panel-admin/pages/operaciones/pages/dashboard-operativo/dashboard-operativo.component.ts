import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { Viaje, Dashboard } from '../../../../models/operaciones.models';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface ViajeConStats extends Viaje {
  transportesAsignados: number;
  alojamientosAsignados: number;
  incidentes: number;
  viajerosRegistrados: number;
}

@Component({
  selector: 'app-dashboard-operativo',
  templateUrl: './dashboard-operativo.component.html',
  styleUrl: './dashboard-operativo.component.css',
})
export class DashboardOperativoComponent implements OnInit {
  cargando = false;
  viajes: ViajeConStats[] = [];

  get totalViajeros(): number {
    return this.viajes.reduce((sum, v) => sum + v.viajerosRegistrados, 0);
  }

  get transportesAsignados(): number {
    return this.viajes.reduce((sum, v) => sum + v.transportesAsignados, 0);
  }

  get alojamientosAsignados(): number {
    return this.viajes.reduce((sum, v) => sum + v.alojamientosAsignados, 0);
  }

  get totalIncidentes(): number {
    return this.viajes.reduce((sum, v) => sum + v.incidentes, 0);
  }

  constructor(private svc: OperacionesService, private router: Router) {}

  ir(ruta: string): void {
    this.router.navigate(['/panel-admin', ruta]);
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.svc.getViajes().subscribe({
      next: (viajes) => {
        if (viajes.length === 0) {
          this.viajes = [];
          this.cargando = false;
          return;
        }
        const dashboardCalls = viajes.map(v =>
          this.svc.getDashboard(v.id).pipe(catchError(() => of(null)))
        );
        forkJoin(dashboardCalls).subscribe({
          next: (dashboards) => {
            this.viajes = viajes.map((v, i) => {
              const d = dashboards[i] as Dashboard | null;
              return {
                ...v,
                transportesAsignados: d?.transportesAsignados ?? 0,
                alojamientosAsignados: d?.alojamientosAsignados ?? 0,
                incidentes: d?.incidentesRegistrados ?? 0,
                viajerosRegistrados: d?.viajerosRegistrados ?? 0,
              };
            });
            this.cargando = false;
          },
          error: () => { this.cargando = false; }
        });
      },
      error: () => { this.cargando = false; }
    });
  }

  actualizar(): void {
    this.cargar();
  }

  getEstadoLabel(estado: string): string {
    const map: Record<string, string> = {
      'programado': 'Programado',
      'activo': 'Activo',
      'en-curso': 'En curso',
      'finalizado': 'Finalizado'
    };
    return map[estado] || estado;
  }

  getEstadoClass(estado: string): string {
    const map: Record<string, string> = {
      'programado': 'activo',
      'activo': 'activo',
      'en-curso': 'en-curso',
      'finalizado': 'finalizado'
    };
    return map[estado] || 'activo';
  }

  getNombreViaje(viaje: Viaje): string {
    return `Viaje #${viaje.id} — Paquete ${viaje.idPaquete}`;
  }
}
