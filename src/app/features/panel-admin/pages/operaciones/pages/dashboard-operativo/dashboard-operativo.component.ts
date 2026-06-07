import { Component, OnInit } from '@angular/core';

interface ViajeOperativo {
  id: number;
  nombre: string;
  destino: string;
  fecha: string;
  totalViajeros: number;
  transporteAsignado: boolean;
  alojamientoAsignado: boolean;
  incidentes: number;
  estado: 'activo' | 'en-curso' | 'finalizado';
}

@Component({
  selector: 'app-dashboard-operativo',
  templateUrl: './dashboard-operativo.component.html',
  styleUrl: './dashboard-operativo.component.css',
})
export class DashboardOperativoComponent implements OnInit {
  cargando = false;

  viajes: ViajeOperativo[] = [
    { id: 1, nombre: 'Plan excursión 2026', destino: 'Santa Marta', fecha: '2026-06-09', totalViajeros: 4, transporteAsignado: true, alojamientoAsignado: true, incidentes: 0, estado: 'activo' },
    { id: 2, nombre: 'Plan turístico Isla de Barú', destino: 'Isla de Barú', fecha: '2026-06-23', totalViajeros: 4, transporteAsignado: false, alojamientoAsignado: false, incidentes: 1, estado: 'activo' },
    { id: 3, nombre: 'Plan vacacional Medellín', destino: 'Medellín', fecha: '2026-06-10', totalViajeros: 12, transporteAsignado: true, alojamientoAsignado: false, incidentes: 0, estado: 'en-curso' },
  ];

  get totalViajeros(): number {
    return this.viajes.reduce((sum, v) => sum + v.totalViajeros, 0);
  }

  get transportesAsignados(): number {
    return this.viajes.filter(v => v.transporteAsignado).length;
  }

  get alojamientosAsignados(): number {
    return this.viajes.filter(v => v.alojamientoAsignado).length;
  }

  get totalIncidentes(): number {
    return this.viajes.reduce((sum, v) => sum + v.incidentes, 0);
  }

  ngOnInit(): void {}

  actualizar(): void {
    this.cargando = true;
    setTimeout(() => { this.cargando = false; }, 800);
  }

  getEstadoLabel(estado: string): string {
    const map: Record<string, string> = { 'activo': 'Activo', 'en-curso': 'En curso', 'finalizado': 'Finalizado' };
    return map[estado] || estado;
  }
}
