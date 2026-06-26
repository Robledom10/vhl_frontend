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
	toastTitle = '';
	toastMsg = '';
	toastType: 'success' | 'error' = 'success';

	viajeSeleccionado: ViajeTransporteDisplay | null = null;
	editandoTransporteId: number | null = null;
	formPreload: Partial<{
		empresa: string; tipoVehiculo: string; placa: string;
		conductor: string; telefonoConductor: string; capacidad: string;
	}> | null = null;

	// Reemplaza: search = '';
	private _search = '';

	get search(): string {
		return this._search;
	}

	set search(val: string) {
		this._search = val;
		this.paginaActual = 0;      // resetea al filtrar
	}

	viajes: ViajeTransporteDisplay[] = [];
	proveedoresTransporte: RespuestaProveedor[] = [];

	// Confirmación de eliminar
	showDeleteModal = false;
	viajeAEliminar: ViajeTransporteDisplay | null = null;

	get viajesFiltrados(): ViajeTransporteDisplay[] {
		const texto = this.search?.toLowerCase() || '';
		return this.viajes
			.filter(v => v.tieneViaje)
			.filter(v =>
				v.titulo.toLowerCase().includes(texto) ||
				(`${v.id}`).includes(texto)
			);
	}

	// ─── Paginación ───────────────────────────────────────────
	pageSize = 5;
	paginaActual = 0;

	get totalElementos(): number {
		return this.viajesFiltrados.length;
	}

	get totalPaginas(): number {
		return Math.ceil(this.totalElementos / this.pageSize);
	}

	get paginas(): number[] {
		const total = this.totalPaginas;
		const actual = this.paginaActual;
		const rango: number[] = [];

		let inicio = Math.max(0, actual - 2);
		let fin = Math.min(total - 1, inicio + 4);
		if (fin - inicio < 4) inicio = Math.max(0, fin - 4);

		for (let i = inicio; i <= fin; i++) rango.push(i);
		return rango;
	}

	get viajesPaginados(): ViajeTransporteDisplay[] {
		const inicio = this.paginaActual * this.pageSize;
		return this.viajesFiltrados.slice(inicio, inicio + this.pageSize);
	}

	cambiarPagina(pagina: number): void {
		if (pagina < 0 || pagina >= this.totalPaginas) return;
		this.paginaActual = pagina;
	}

	constructor(
		private svc: OperacionesService,
		private pkgSvc: PackageService,
	) { }

	ngOnInit(): void {
		this.cargarViajes();
		this.pkgSvc.getProveedoresByTipo('Transporte').subscribe({
			next: (items) => { this.proveedoresTransporte = items; },
			error: () => { },
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
			error: () => {
				this.mostrarToast('Error', 'No se pudieron cargar los viajes y transportes.', 'error');
			},
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
		this.mostrarToast('Listo', msg, 'success');
	}

	onFormFailed(msg: string): void {
		this.mostrarToast('Error', msg, 'error');
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

	// ─── Eliminar con confirmación ──────────────────────────────

	eliminar(viaje: ViajeTransporteDisplay): void {
		if (!viaje.id || !viaje.transportes.length) return;
		this.viajeAEliminar = viaje;
		this.showDeleteModal = true;
	}

	cerrarDeleteModal(): void {
		this.showDeleteModal = false;
		this.viajeAEliminar = null;
	}

	confirmarEliminar(): void {
		const viaje = this.viajeAEliminar;
		if (!viaje || !viaje.id || !viaje.transportes.length) return;
		this.showDeleteModal = false;
		const id = viaje.transportes[0].id;

		this.svc.eliminarTransporte(viaje.id, id).subscribe({
			next: () => {
				this.viajeAEliminar = null;
				this.mostrarToast('Transporte eliminado', `Se eliminó el transporte asignado a ${viaje.titulo}.`, 'success');
				this.cargarViajes();
			},
			error: () => {
				this.viajeAEliminar = null;
				this.mostrarToast('Error al eliminar', `No se pudo eliminar el transporte de ${viaje.titulo}.`, 'error');
			},
		});
	}

	mostrarToast(title: string, msg: string, type: 'success' | 'error' = 'success'): void {
		this.toastTitle = title;
		this.toastMsg = msg;
		this.toastType = type;
		this.showToast = true;
		setTimeout(() => { this.showToast = false; }, 3500);
	}
}