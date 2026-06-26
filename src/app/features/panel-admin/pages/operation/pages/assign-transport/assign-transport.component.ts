import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { PackageService } from '../../../../../../core/services/package.service';
import { RespuestaProveedor } from '../../../../models/package.model';
import { Viaje, Transporte } from '../../../../models/operaciones.models';
import { ViajeTransporteDisplay } from '../../models/operaciones-display.models';

@Component({
	selector: 'app-assign-transport',
	templateUrl: './assign-transport.component.html',
	styleUrl: './assign-transport.component.css',
})
export class AsignarTransporteComponent implements OnInit {
	showForm = false;
	showDetalle = false;
	viajeDetalle: ViajeTransporteDisplay | null = null;
	showToast = false;
	toastMsg = '';
	toastType: 'success' | 'error' = 'success';

	viajeSeleccionado: ViajeTransporteDisplay | null = null;
	editandoTransporteId: number | null = null;
	formPreload: Partial<{
		empresa: string; tipoVehiculo: string; placa: string;
		conductor: string; telefonoConductor: string; capacidad: string;
	}> | null = null;

	search = '';
	viajes: ViajeTransporteDisplay[] = [];
	proveedoresTransporte: RespuestaProveedor[] = [];

	get viajesFiltrados(): ViajeTransporteDisplay[] {
		const texto = this.search?.toLowerCase() || '';
		return this.viajes
			.filter(v => v.tieneViaje)
			.filter(v =>
				v.titulo.toLowerCase().includes(texto) ||
				(`${v.id}`).includes(texto)
			);
	}

	constructor(
		private svc: OperacionesService,
		private pkgSvc: PackageService,
	) {}

	ngOnInit(): void {
		this.cargarViajes();
		this.pkgSvc.getProveedoresByTipo('Transporte').subscribe({
			next: (items) => { this.proveedoresTransporte = items; },
			error: () => {},
		});
	}

	cargarViajes(): void {
		forkJoin({
			paquetes: this.svc.getAllPaquetes().pipe(catchError(() => of([]))),
			viajes: this.svc.getViajes().pipe(catchError(() => of([]))),
		}).pipe(
			switchMap(({ paquetes, viajes }) => {
				if (viajes.length === 0) {
					return of(paquetes.map(p => this.toDisplaySinViaje(p)));
				}
				return forkJoin(
					viajes.map(v =>
						this.svc.getTransportes(v.id).pipe(
							catchError(() => of([])),
							map(transportes => this.toDisplay(
								v, transportes as Transporte[],
								paquetes.find(p => p.id === v.idPaquete)?.titulo,
								paquetes.find(p => p.id === v.idPaquete)?.destino
							))
						)
					)
				).pipe(
					map(viajeRows => {
						const conViaje = new Set(viajes.map(v => v.idPaquete));
						const sinViaje = paquetes
							.filter(p => !conViaje.has(p.id))
							.map(p => this.toDisplaySinViaje(p));
						return [...viajeRows, ...sinViaje];
					})
				);
			})
		).subscribe({
			next: items => { this.viajes = [...items]; },
			error: () => {},
		});
	}

	private toDisplaySinViaje(p: { id: number; titulo: string; destino: string }): ViajeTransporteDisplay {
		return {
			idPaquete: p.id, id: null, nombre: p.titulo, titulo: p.titulo,
			destino: p.destino, fecha: '', cupo: 0, tieneViaje: false,
			transporteAsignado: false, transportes: [],
		};
	}

	private toDisplay(v: Viaje, transportes: Transporte[], titulo?: string, destino?: string): ViajeTransporteDisplay {
		const t = titulo || `Paquete ${v.idPaquete}`;
		return {
			idPaquete: v.idPaquete, id: v.id, nombre: `${t} — Viaje #${v.id}`, titulo: t,
			destino: destino || `Paquete ${v.idPaquete}`, fecha: v.fechaSalida,
			cupo: transportes[0]?.cantidadViajeros ?? 0, tieneViaje: true,
			transporteAsignado: transportes.length > 0, transportes,
		};
	}

	// ─── Apertura del formulario ──────────────────────────────

	abrirNuevo(): void {
		this.viajeSeleccionado = null;
		this.editandoTransporteId = null;
		this.formPreload = null;
		this.showForm = true;
	}

	asignarDesdeProveedor(p: RespuestaProveedor): void {
		this.viajeSeleccionado = null;
		this.editandoTransporteId = null;
		this.formPreload = {
			empresa: p.nombre,
			tipoVehiculo: p.tipoVehiculo || '',
			placa: p.placa || '',
			conductor: p.conductor || '',
			telefonoConductor: p.telefonoConductor || p.telefono || '',
			capacidad: p.capacidad ? String(p.capacidad) : '',
		};
		this.showForm = true;
	}

	seleccionarViaje(viaje: ViajeTransporteDisplay): void {
		this.viajeSeleccionado = viaje;
		this.editandoTransporteId = viaje.transporteAsignado && viaje.transportes.length > 0
			? viaje.transportes[0].id
			: null;
		this.formPreload = null;
		this.showForm = true;
	}

	cerrarForm(): void {
		this.showForm = false;
		this.viajeSeleccionado = null;
		this.editandoTransporteId = null;
		this.formPreload = null;
	}

	onFormSaved(msg: string): void {
		this.showForm = false;
		this.viajeSeleccionado = null;
		this.editandoTransporteId = null;
		this.formPreload = null;
		this.cargarViajes();
		this.mostrarToast(msg);
	}

	onFormFailed(msg: string): void {
		this.mostrarToast(msg, 'error');
	}

	// ─── Detalle ──────────────────────────────────────────────

	verDetalle(viaje: ViajeTransporteDisplay): void {
		this.viajeDetalle = viaje;
		this.showDetalle = true;
	}

	cerrarDetalle(): void {
		this.showDetalle = false;
		this.viajeDetalle = null;
	}

	// ─── Eliminar ─────────────────────────────────────────────

	eliminar(viaje: ViajeTransporteDisplay): void {
		if (!viaje.id || !viaje.transportes.length) return;
		if (!confirm(`¿Eliminar el transporte asignado a ${viaje.titulo}?`)) return;
		const id = viaje.transportes[0].id;
		this.svc.eliminarTransporte(viaje.id, id).subscribe({
			next: () => {
				this.mostrarToast('Transporte eliminado');
				this.cargarViajes();
			},
			error: () => this.mostrarToast('Error al eliminar el transporte', 'error'),
		});
	}

	mostrarToast(msg: string, type: 'success' | 'error' = 'success'): void {
		this.toastMsg = msg;
		this.toastType = type;
		this.showToast = true;
		setTimeout(() => { this.showToast = false; }, 3500);
	}
}
