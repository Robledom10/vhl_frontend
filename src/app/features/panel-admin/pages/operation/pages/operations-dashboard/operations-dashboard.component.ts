import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { Dashboard } from '../../../../models/operaciones.models';
import { forkJoin, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

interface FilaDashboard {
	idPaquete: number;
	paqueteTitulo: string;
	paqueteDestino: string;
	tieneViaje: boolean;
	idViaje?: number;
	fechaSalida?: string;
	estado?: string;
	viajerosRegistrados: number;
	transportesAsignados: number;
	alojamientosAsignados: number;
	incidentes: number;
}

@Component({
	selector: 'app-operations-dashboard',
	templateUrl: './operations-dashboard.component.html',
	styleUrl: './operations-dashboard.component.css',
})
export class DashboardOperativoComponent implements OnInit {
	cargando = false;
	filas: FilaDashboard[] = [];
	paquetes: { id: number; titulo: string; destino: string; fechaInicio: string; duracionDias: number }[] = [];

	// ─── Paginación ───────────────────────────────────────
	paginaActual = 0;
	totalPaginas = 0;
	totalElementos = 0;
	tamano = 5;

	get paginas(): number[] {
		const delta = 2;
		const start = Math.max(0, this.paginaActual - delta);
		const end = Math.min(this.totalPaginas - 1, this.paginaActual + delta);
		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	}

	cambiarPagina(n: number): void {
		if (n < 0 || n >= this.totalPaginas) return;
		this.paginaActual = n;
		this.cargar();
	}

	filaEditando: FilaDashboard | null = null;
	enviandoViaje = false;

	showViajeForm = false;
	showToast = false;
	toastMsg = '';
	toastType: 'success' | 'error' = 'success';

	showDetalle = false;
	viajeDetalle: FilaDashboard | null = null;

	showEditViaje = false;
	editandoViajeId: number | null = null;
	enviandoEdicion = false;

	showConfirmDelete = false;
	viajePendienteEliminar: FilaDashboard | null = null;
	eliminando = false;

	get totalViajeros(): number {
		return this.filas.reduce((sum, f) => sum + f.viajerosRegistrados, 0);
	}

	get transportesAsignados(): number {
		return this.filas.filter(f => f.tieneViaje && f.transportesAsignados > 0).length;
	}

	get totalViajesActivos(): number {
		return this.filas.filter(f => f.tieneViaje).length;
	}

	get alojamientosAsignados(): number {
		return this.filas.filter(f => f.tieneViaje && f.alojamientosAsignados > 0).length;
	}

	get totalIncidentes(): number {
		return this.filas.reduce((sum, f) => sum + f.incidentes, 0);
	}

	get duracionPaquete(): number {

		if (!this.filaEditando) return 1;

		return this.paquetes.find(
			p => p.id === this.filaEditando?.idPaquete
		)?.duracionDias ?? 1;
	}

	constructor(private svc: OperacionesService, private router: Router) { }

	ir(ruta: string): void {
		this.router.navigate(['/panel-admin', ruta]);
	}

	ngOnInit(): void {
		this.cargar();
	}

	cargar(): void {
		this.cargando = true;

		forkJoin({
			paquetes: this.svc.getAllPaquetes().pipe(catchError(() => of([]))),
			viajesPage: this.svc.getViajesPaginados(this.paginaActual, this.tamano).pipe(catchError(() => of(null))),
		}).subscribe({
			next: ({ paquetes, viajesPage }) => {
				this.paquetes = paquetes;

				const page = viajesPage as any;
				this.totalPaginas = page?.totalPages ?? 0;
				this.totalElementos = page?.totalElements ?? 0;
				this.paginaActual = page?.number ?? this.paginaActual;
				const viajes: any[] = page?.content ?? [];

				if (viajes.length === 0) {
					this.filas = [];
					this.cargando = false;
					return;
				}

<<<<<<< HEAD:src/app/features/panel-admin/pages/packages/pages/operations-dashboard/operations-dashboard.component.ts
				const dashboardCalls = viajes.map(v =>
					this.svc.getDashboard(v.id).pipe(timeout(8000), catchError(() => of(null)))
=======
				const dashboardCalls = viajes.map((v: any) =>
					this.svc.getDashboard(v.id).pipe(catchError(() => of(null)))
>>>>>>> main:src/app/features/panel-admin/pages/operation/pages/operations-dashboard/operations-dashboard.component.ts
				);

				forkJoin(dashboardCalls).subscribe({
					next: (dashboards) => {
						const viajeFilas: FilaDashboard[] = viajes.map((v: any, i: number) => {
							const d = dashboards[i] as Dashboard | null;
							const p = paquetes.find(pk => pk.id === v.idPaquete);
							return {
								idPaquete: v.idPaquete,
								paqueteTitulo: p?.titulo || `Paquete ${v.idPaquete}`,
								paqueteDestino: p?.destino || '',
								tieneViaje: true,
								idViaje: v.id,
								fechaSalida: v.fechaSalida,
								estado: v.estado,
								viajerosRegistrados: d?.viajerosRegistrados ?? 0,
								transportesAsignados: d?.transportesAsignados ?? 0,
								alojamientosAsignados: d?.alojamientosAsignados ?? 0,
								incidentes: d?.incidentesRegistrados ?? 0,
							};
						});

						this.filas = viajeFilas;
						this.cargando = false;
					},
					error: () => { this.cargando = false; }
				});
			},
			error: () => { this.cargando = false; }
		});
	}

	abrirNuevoViaje(): void {
		this.showViajeForm = true;
	}

	guardarViaje(): void {
		this.showViajeForm = false;
		this.mostrarToast('Viaje creado correctamente');
		this.cargar();
	}

	cerrarViajeForm(): void {
		this.showViajeForm = false;
	}

	onViajeCreado(): void {
		this.showViajeForm = false;
		this.mostrarToast('Viaje creado correctamente');
		this.cargar();
	}

	mostrarToast(
		mensaje: string,
		tipo: 'success' | 'error' = 'success'
	): void {

		this.toastMsg = mensaje;
		this.toastType = tipo;
		this.showToast = true;

		setTimeout(() => {
			this.showToast = false;
		}, 3000);
	}

	// --- Detalle ---

	verDetalleViaje(fila: FilaDashboard): void {
		this.viajeDetalle = fila;
		this.showDetalle = true;
	}

	cerrarDetalle(): void {
		this.showDetalle = false;
		this.viajeDetalle = null;
	}

	// --- Editar viaje ---

	editarViaje(fila: FilaDashboard): void {

		if (!fila.idViaje) return;

		this.filaEditando = fila;
		this.editandoViajeId = fila.idViaje;

		this.showEditViaje = true;
	}

	cerrarEditViaje(): void {
		this.showEditViaje = false;
		this.editandoViajeId = null;
		this.filaEditando = null;
	}

	actualizarViaje(): void {

		this.cerrarEditViaje();

		this.mostrarToast(
			'Viaje actualizado correctamente'
		);

		this.cargar();
	}

	// --- Eliminar viaje ---

	eliminarViajeRow(fila: FilaDashboard): void {
		if (!fila.idViaje) return;
		this.viajePendienteEliminar = fila;
		this.showConfirmDelete = true;
	}

	confirmarEliminar(): void {
		if (!this.viajePendienteEliminar?.idViaje) return;
		const idViaje = this.viajePendienteEliminar.idViaje;
		this.eliminando = true;

		this.svc.eliminarViaje(idViaje).subscribe({
			next: () => {
				this.eliminando = false;
				this.showConfirmDelete = false;
				this.viajePendienteEliminar = null;
				this.mostrarToast('Viaje eliminado correctamente');
				this.cargar();
			},
			error: (err) => {
				this.eliminando = false;
				this.showConfirmDelete = false;
				this.viajePendienteEliminar = null;
				const msg = err?.error?.mensaje || err?.error?.message || 'Error al eliminar el viaje';
				this.mostrarToast(msg, 'error');
			}
		});
	}

	cancelarEliminar(): void {
		this.showConfirmDelete = false;
		this.viajePendienteEliminar = null;
	}

	// --- Estado ---

	getEstadoLabel(estado?: string): string {
		if (!estado) return 'Sin viaje';
		const map: Record<string, string> = {
			'programado': 'Programado',
			'activo': 'Activo',
			'en-curso': 'En curso',
			'finalizado': 'Finalizado',
		};
		return map[estado] || estado;
	}

	getEstadoClass(fila: FilaDashboard): string {
		if (!fila.tieneViaje) return 'sin-viaje';
		const map: Record<string, string> = {
			'programado': 'activo',
			'activo': 'activo',
			'en-curso': 'en-curso',
			'finalizado': 'finalizado',
		};
		return map[fila.estado || ''] || 'activo';
	}
}
