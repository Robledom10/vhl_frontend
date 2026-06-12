import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { Dashboard } from '../../../../models/operaciones.models';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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

	showViajeForm = false;
	enviandoViaje = false;
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

	viajeForm = this.fb.group({
		idPaquete: ['', Validators.required],
		fechaSalida: ['', Validators.required],
		fechaRegreso: [''],
	});

	editViajeForm = this.fb.group({
		fechaSalida: ['', Validators.required],
		fechaRegreso: [{ value: '', disabled: true }],
	});

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

	constructor(
		private svc: OperacionesService,
		private router: Router,
		private fb: FormBuilder,
		private authSvc: AuthService,
	) { }

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
			viajes: this.svc.getViajes().pipe(catchError(() => of([]))),
		}).subscribe({
			next: ({ paquetes, viajes }) => {
				this.paquetes = paquetes;

				if (viajes.length === 0) {
					this.filas = [];
					this.cargando = false;
					return;
				}

				const dashboardCalls = viajes.map(v =>
					this.svc.getDashboard(v.id).pipe(catchError(() => of(null)))
				);

				forkJoin(dashboardCalls).subscribe({
					next: (dashboards) => {
						const viajeFilas: FilaDashboard[] = viajes.map((v, i) => {
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

	actualizar(): void {
		this.cargar();
	}

	// --- Nuevo viaje ---

	abrirNuevoViaje(): void {

		this.viajeForm.reset();

		this.viajeForm
			.get('fechaSalida')
			?.valueChanges
			.subscribe((fecha) => {

				const pkg =
					this.paquetes.find(
						p =>
							p.id === Number(
								this.viajeForm.value.idPaquete
							)
					);

				if (!fecha || !pkg) return;

				this.viajeForm.patchValue({

					fechaRegreso:
						this.calcularFechaRegreso(
							fecha,
							pkg.duracionDias
						)

				}, {
					emitEvent: false
				});

			});

		this.showViajeForm = true;

	}

	cerrarViajeForm(): void {
		this.showViajeForm = false;
	}

	guardarViaje(): void {

		if (this.viajeForm.invalid) {
			this.viajeForm.markAllAsTouched();
			return;
		}

		const idUsuario =
			this.authSvc.getUser()?.id;

		if (!idUsuario) {
			this.mostrarToast(
				'No se pudo obtener el usuario activo',
				'error'
			);
			return;
		}

		const v = this.viajeForm.value;

		const pkg =
			this.paquetes.find(
				p => p.id === Number(v.idPaquete)
			);

		if (!pkg) {
			this.mostrarToast(
				'Paquete inválido',
				'error'
			);
			return;
		}

		const fechaSalida =
			v.fechaSalida || '';

		const fechaRegreso =
			this.calcularFechaRegreso(
				fechaSalida,
				pkg.duracionDias || 1
			);

		this.enviandoViaje = true;

		this.svc.crearViaje({
			idUsuario,
			idPaquete: Number(v.idPaquete),
			fechaSalida,
			fechaRegreso
		})
			.subscribe({

				next: () => {

					this.enviandoViaje = false;

					this.showViajeForm = false;

					this.mostrarToast(
						'Viaje creado correctamente'
					);

					this.cargar();

				},

				error: (err) => {

					this.enviandoViaje = false;

					const msg =
						err?.error?.mensaje ||
						err?.error?.message ||
						'Error al crear viaje';

					this.mostrarToast(
						msg,
						'error'
					);

				}

			});

	}

	mostrarToast(msg: string, type: 'success' | 'error' = 'success'): void {
		this.toastMsg = msg; this.toastType = type; this.showToast = true;
		setTimeout(() => { this.showToast = false; }, 3500);
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

	private calcularFechaRegreso(
		fechaSalida: string,
		duracionDias: number
	): string {

		if (!fechaSalida) return '';

		const fecha = new Date(fechaSalida);

		fecha.setDate(
			fecha.getDate() + (duracionDias || 1)
		);

		const yyyy = fecha.getFullYear();
		const mm = String(fecha.getMonth() + 1).padStart(2, '0');
		const dd = String(fecha.getDate()).padStart(2, '0');
		const hh = String(fecha.getHours()).padStart(2, '0');
		const min = String(fecha.getMinutes()).padStart(2, '0');

		return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
	}

	// --- Editar viaje ---

	editarViaje(fila: FilaDashboard): void {

		if (!fila.idViaje) return;

		this.editandoViajeId = fila.idViaje;

		const paquete =
			this.paquetes.find(
				p => p.id === fila.idPaquete
			);

		const fechaSalida =
			fila.fechaSalida?.substring(0, 16) || '';

		this.editViajeForm.patchValue({
			fechaSalida,
			fechaRegreso: this.calcularFechaRegreso(
				fechaSalida,
				paquete?.duracionDias || 1
			)
		});

		this.editViajeForm
			.get('fechaSalida')
			?.valueChanges
			.subscribe((valor) => {

				if (!valor) return;

				this.editViajeForm.patchValue({
					fechaRegreso:
						this.calcularFechaRegreso(
							valor,
							paquete?.duracionDias || 1
						)
				}, {
					emitEvent: false
				});

			});

		this.showEditViaje = true;
	}

	cerrarEditViaje(): void {
		this.showEditViaje = false;
		this.editandoViajeId = null;
		this.editViajeForm.reset();
	}

	actualizarViaje(): void {
		if (this.editViajeForm.invalid) { this.editViajeForm.markAllAsTouched(); return; }
		if (!this.editandoViajeId) return;

		const idUsuario = this.authSvc.getUser()?.id;
		if (!idUsuario) { this.mostrarToast('No se pudo obtener el usuario activo', 'error'); return; }

		const fila = this.filas.find(f => f.idViaje === this.editandoViajeId);
		const toISO = (s: string) => s.length === 16 ? s + ':00' : s;
		const v = this.editViajeForm.getRawValue();

		this.enviandoEdicion = true;
		this.svc.actualizarViaje(this.editandoViajeId, {
			idUsuario,
			idPaquete: fila?.idPaquete,
			fechaSalida: toISO(v.fechaSalida || ''),
			fechaRegreso: toISO(v.fechaRegreso || ''),
		}).subscribe({
			next: () => {
				this.enviandoEdicion = false;
				this.cerrarEditViaje();
				this.mostrarToast('Viaje actualizado correctamente');
				this.cargar();
			},
			error: (err) => {
				this.enviandoEdicion = false;
				const msg = err?.error?.mensaje || err?.error?.message || 'Error al actualizar el viaje';
				this.mostrarToast(msg, 'error');
			}
		});
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
