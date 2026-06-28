import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { PackageService } from '../../../../../../core/services/package.service';
import { RespuestaProveedor } from '../../../../models/package.model';
import { Viaje, Alojamiento } from '../../../../models/operaciones.models';
import { ViajeAlojamientoDisplay, UsuarioDisplay } from '../../models/operaciones-display.models';

@Component({
	selector: 'app-assign-accommodation',
	templateUrl: './assign-accommodation.component.html',
	styleUrl: './assign-accommodation.component.css',
})
export class AsignarAlojamientoComponent implements OnInit {
	showForm = false;
	showDetalle = false;
	viajeDetalle: ViajeAlojamientoDisplay | null = null;
	showToast = false;
	toastTitle = '';
	toastMsg = '';
	toastType: 'success' | 'error' = 'success';

	viajeSeleccionado: ViajeAlojamientoDisplay | null = null;
	editandoId: number | null = null;
	formPreload: { nombreHotel?: string; direccion?: string } | null = null;

	viajes: ViajeAlojamientoDisplay[] = [];
	usuarios: UsuarioDisplay[] = [];
	proveedoresAlojamiento: RespuestaProveedor[] = [];

	// Confirmación de eliminar
	showDeleteModal = false;
	viajeAEliminar: ViajeAlojamientoDisplay | null = null;

	// ─── Búsqueda ─────────────────────────────────────────────
	private _search = '';
	get search(): string { return this._search; }
	set search(val: string) {
		this._search = val;
		this.paginaActual = 0;
	}

	// ─── Paginación ───────────────────────────────────────────
	pageSize = 5;
	paginaActual = 0;

	get viajesFiltrados(): ViajeAlojamientoDisplay[] {
		const texto = this._search?.toLowerCase() || '';
		return this.viajes
			.filter(v => v.tieneViaje)
			.filter(v =>
				v.titulo.toLowerCase().includes(texto) ||
				(`${v.id}`).includes(texto)
			);
	}

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

	get viajesPaginados(): ViajeAlojamientoDisplay[] {
		const inicio = this.paginaActual * this.pageSize;
		return this.viajesFiltrados.slice(inicio, inicio + this.pageSize);
	}

	cambiarPagina(pagina: number): void {
		if (pagina < 0 || pagina >= this.totalPaginas) return;
		this.paginaActual = pagina;
	}

	constructor(
		private svc: OperacionesService,
		private authSvc: AuthService,
		private pkgSvc: PackageService,
	) { }

	ngOnInit(): void {
		this.authSvc.getAllUsers().subscribe({
			next: (response: any) => {
				const users: any[] = response?.content ?? (Array.isArray(response) ? response : []);
				this.usuarios = users.map(u => ({ id: u.id, firstName: u.firstName, lastName: u.lastName }));
			},
			error: () => { },
		});
		this.pkgSvc.getProveedoresByTipo('Hotel').subscribe({
			next: (items) => { this.proveedoresAlojamiento = items; },
			error: () => { },
		});
		this.cargarViajes();
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
						this.svc.getAlojamientos(v.id).pipe(
							catchError(() => of([])),
							map(alojamientos => this.toDisplay(
								v, alojamientos as Alojamiento[],
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
				this.mostrarToast('Error', 'No se pudieron cargar los viajes y alojamientos.', 'error');
			},
		});
	}

	private toDisplaySinViaje(p: { id: number; titulo: string; destino: string }): ViajeAlojamientoDisplay {
		return {
			idPaquete: p.id, id: null, nombre: p.titulo, titulo: p.titulo, destino: p.destino,
			fecha: '', cupo: 0, tieneViaje: false, alojamientoAsignado: false,
			alojamientoId: null, hotel: null, habitacion: null, direccion: null,
			viajeroNombre: null, alojamientoFechaIngreso: null, alojamientoFechaSalida: null,
		};
	}

	private toDisplay(v: Viaje, alojamientos: Alojamiento[], titulo?: string, destino?: string): ViajeAlojamientoDisplay {
		const a = alojamientos[0] ?? null;
		const t = titulo || `Paquete ${v.idPaquete}`;
		return {
			idPaquete: v.idPaquete, id: v.id, nombre: `${t} — Viaje #${v.id}`, titulo: t,
			destino: destino || `Paquete ${v.idPaquete}`, fecha: v.fechaSalida, cupo: alojamientos.length,
			tieneViaje: true, alojamientoAsignado: alojamientos.length > 0,
			alojamientoId: a ? a.id : null, hotel: a ? a.hotel : null,
			habitacion: a ? a.habitacion : null, direccion: a ? a.direccion : null,
			viajeroNombre: a ? (a.nombreViajero || null) : null,
			alojamientoFechaIngreso: a ? a.fechaIngreso : null,
			alojamientoFechaSalida: a ? a.fechaSalida : null,
		};
	}

	// ─── Apertura del formulario ──────────────────────────────

	abrirNuevo(): void {
		this.viajeSeleccionado = null;
		this.editandoId = null;
		this.formPreload = null;
		this.showForm = true;
	}

	asignarDesdeProveedor(p: RespuestaProveedor): void {
		this.viajeSeleccionado = null;
		this.editandoId = null;
		this.formPreload = { nombreHotel: p.nombre, direccion: p.direccion || '' };
		this.showForm = true;
	}

	seleccionarViaje(viaje: ViajeAlojamientoDisplay): void {
		this.viajeSeleccionado = viaje;
		this.editandoId = viaje.alojamientoId;
		this.formPreload = null;
		this.showForm = true;
	}

	cerrarForm(): void {
		this.showForm = false;
		this.viajeSeleccionado = null;
		this.editandoId = null;
		this.formPreload = null;
	}

	onFormSaved(msg: string): void {
		this.showForm = false;
		this.viajeSeleccionado = null;
		this.editandoId = null;
		this.formPreload = null;
		this.cargarViajes();
		this.mostrarToast('Listo', msg, 'success');
	}

	onFormFailed(msg: string): void {
		this.mostrarToast('Error', msg, 'error');
	}

	// ─── Detalle ──────────────────────────────────────────────

	verDetalle(viaje: ViajeAlojamientoDisplay): void {
		this.viajeDetalle = viaje;
		this.showDetalle = true;
	}

	cerrarDetalle(): void {
		this.showDetalle = false;
		this.viajeDetalle = null;
	}

	// ─── Eliminar con confirmación ──────────────────────────────

	eliminar(viaje: ViajeAlojamientoDisplay): void {
		if (!viaje.id || !viaje.alojamientoId) return;
		this.viajeAEliminar = viaje;
		this.showDeleteModal = true;
	}

	cerrarDeleteModal(): void {
		this.showDeleteModal = false;
		this.viajeAEliminar = null;
	}

	confirmarEliminar(): void {
		const viaje = this.viajeAEliminar;
		if (!viaje || !viaje.id || !viaje.alojamientoId) return;
		this.showDeleteModal = false;

		this.svc.eliminarAlojamiento(viaje.id, viaje.alojamientoId).subscribe({
			next: () => {
				this.viajeAEliminar = null;
				this.mostrarToast('Alojamiento eliminado', `Se eliminó el alojamiento asignado a ${viaje.titulo}.`, 'success');
				this.cargarViajes();
			},
			error: () => {
				this.viajeAEliminar = null;
				this.mostrarToast('Error al eliminar', `No se pudo eliminar el alojamiento de ${viaje.titulo}.`, 'error');
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