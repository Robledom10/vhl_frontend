import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { PackageService } from '../../../../../../core/services/package.service';
import { RespuestaProveedor } from '../../../../models/package.model';
import { Viaje, Alojamiento } from '../../../../models/operaciones.models';

interface ViajeDisplay {
	idPaquete: number;
	id: number | null;
	nombre: string;
	titulo: string;
	destino: string;
	fecha: string;
	cupo: number;
	tieneViaje: boolean;
	alojamientoAsignado: boolean;
	alojamientoId: number | null;
	hotel: string | null;
	habitacion: string | null;
	direccion: string | null;
	viajeroNombre: string | null;
	alojamientoFechaIngreso: string | null;
	alojamientoFechaSalida: string | null;
}

interface Usuario { id: number; firstName: string; lastName: string; }

@Component({
	selector: 'app-assign-accommodation',
	templateUrl: './assign-accommodation.component.html',
	styleUrl: './assign-accommodation.component.css',
})
export class AsignarAlojamientoComponent implements OnInit {
	showForm = false;
	showDetalle = false;
	viajeDetalle: ViajeDisplay | null = null;
	enviando = false;
	showToast = false;
	toastMsg = '';
	toastType: 'success' | 'error' = 'success';
	viajeSeleccionado: ViajeDisplay | null = null;
	editandoId: number | null = null;
	showCalendarCheckIn = false;
	showCalendarCheckOut = false;

	viajes: ViajeDisplay[] = [];
	usuarios: Usuario[] = [];
	errorUsuarios = false;
	proveedoresAlojamiento: RespuestaProveedor[] = [];

	get viajesConViaje(): ViajeDisplay[] {
		return this.viajes.filter(v => v.tieneViaje);
	}

	alojamientoForm = this.fb.group({
		idViaje: [''],
		nombreViajero: [''],
		nombreHotel: ['', [Validators.required, Validators.minLength(3)]],
		habitacion: ['', Validators.required],
		direccion: ['', Validators.required],
		checkIn: ['', Validators.required],
		checkOut: ['', Validators.required],
	});

	constructor(
		private fb: FormBuilder,
		private svc: OperacionesService,
		private authSvc: AuthService,
		private pkgSvc: PackageService,
	) { }

	ngOnInit(): void {
		this.authSvc.getAllUsers().subscribe({
			next: (users: any[]) => {
				this.usuarios = users.map(u => ({ id: u.id, firstName: u.firstName, lastName: u.lastName }));
			},
			error: () => { this.errorUsuarios = true; }
		});
		this.pkgSvc.getProveedoresByTipo('Hotel').subscribe({
			next: (items) => { this.proveedoresAlojamiento = items; },
			error: () => { }
		});
		this.cargarViajes();
	}

	seleccionarProveedorAlojamiento(event: Event): void {
		const id = Number((event.target as HTMLSelectElement).value);
		if (!id) return;
		const p = this.proveedoresAlojamiento.find(x => x.id === id);
		if (!p) return;
		this.alojamientoForm.patchValue({
			nombreHotel: p.nombre,
			direccion: p.direccion || '',
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
			error: () => { }
		});
	}

	private toDisplaySinViaje(p: { id: number; titulo: string; destino: string }): ViajeDisplay {
		return {
			idPaquete: p.id,
			id: null,
			nombre: p.titulo,
			titulo: p.titulo,
			destino: p.destino,
			fecha: '',
			cupo: 0,
			tieneViaje: false,
			alojamientoAsignado: false,
			alojamientoId: null,
			hotel: null,
			habitacion: null,
			direccion: null,
			viajeroNombre: null,
			alojamientoFechaIngreso: null,
			alojamientoFechaSalida: null,
		};
	}

	private toDisplay(v: Viaje, alojamientos: Alojamiento[], titulo?: string, destino?: string): ViajeDisplay {
		const a = alojamientos[0] ?? null;
		const t = titulo || `Paquete ${v.idPaquete}`;
		return {
			idPaquete: v.idPaquete,
			id: v.id,
			nombre: `${t} — Viaje #${v.id}`,
			titulo: t,
			destino: destino || `Paquete ${v.idPaquete}`,
			fecha: v.fechaSalida,
			cupo: alojamientos.length,
			tieneViaje: true,
			alojamientoAsignado: alojamientos.length > 0,
			alojamientoId: a ? a.id : null,
			hotel: a ? a.hotel : null,
			habitacion: a ? a.habitacion : null,
			direccion: a ? a.direccion : null,
			viajeroNombre: a ? (a.nombreViajero || null) : null,
			alojamientoFechaIngreso: a ? a.fechaIngreso : null,
			alojamientoFechaSalida: a ? a.fechaSalida : null,
		};
	}

	abrirNuevo(): void {
		this.viajeSeleccionado = null;
		this.editandoId = null;
		this.alojamientoForm.reset();
		this.showCalendarCheckIn = false;
		this.showCalendarCheckOut = false;
		this.showForm = true;
	}

	asignarDesdeProveedor(p: RespuestaProveedor): void {
		this.viajeSeleccionado = null;
		this.editandoId = null;
		this.alojamientoForm.reset();
		this.showCalendarCheckIn = false;
		this.showCalendarCheckOut = false;
		this.alojamientoForm.patchValue({
			nombreHotel: p.nombre,
			direccion: p.direccion || '',
		});
		this.showForm = true;
	}

	seleccionarViaje(viaje: ViajeDisplay): void {
		this.viajeSeleccionado = viaje;
		this.editandoId = viaje.alojamientoId;
		this.alojamientoForm.reset();
		if (viaje.alojamientoAsignado) {
			this.alojamientoForm.patchValue({
				nombreViajero: viaje.viajeroNombre || '',
				nombreHotel: viaje.hotel || '',
				habitacion: viaje.habitacion || '',
				direccion: viaje.direccion || '',
				checkIn: viaje.alojamientoFechaIngreso ? viaje.alojamientoFechaIngreso.substring(0, 10) : '',
				checkOut: viaje.alojamientoFechaSalida ? viaje.alojamientoFechaSalida.substring(0, 10) : '',
			});
		}
		this.showForm = true;
	}

	getViajeroNombre(nombre: string | null): string {
		return nombre || '—';
	}

	cerrarForm(): void { this.showForm = false; this.viajeSeleccionado = null; this.editandoId = null; this.showCalendarCheckIn = false; this.showCalendarCheckOut = false; }

	verDetalle(viaje: ViajeDisplay): void { this.viajeDetalle = viaje; this.showDetalle = true; }
	cerrarDetalle(): void { this.showDetalle = false; this.viajeDetalle = null; }

	eliminar(viaje: ViajeDisplay): void {
		if (!viaje.id || !viaje.alojamientoId) return;
		if (!confirm(`¿Eliminar el alojamiento asignado a ${viaje.titulo}?`)) return;
		this.svc.eliminarAlojamiento(viaje.id, viaje.alojamientoId).subscribe({
			next: () => {
				this.mostrarToast('Alojamiento eliminado');
				this.cargarViajes();
			},
			error: () => this.mostrarToast('Error al eliminar el alojamiento', 'error')
		});
	}

	guardar(): void {
		if (this.alojamientoForm.invalid) { this.alojamientoForm.markAllAsTouched(); return; }
		this.enviando = true;

		const v = this.alojamientoForm.value;
		const idViaje = this.viajeSeleccionado?.id || Number(v.idViaje);
		if (!idViaje) {
			this.enviando = false;
			this.mostrarToast('Selecciona un viaje', 'error');
			return;
		}
		const nombreDigitado = (v.nombreViajero || '').trim().toLowerCase();
		const encontrado = nombreDigitado
			? this.usuarios.find(u =>
				`${u.firstName} ${u.lastName}`.toLowerCase() === nombreDigitado ||
				u.firstName.toLowerCase() === nombreDigitado
			)
			: null;
		const idViajero = encontrado?.id ?? (this.authSvc.getUser()?.id ?? 1);
		const nombreViajero = (v.nombreViajero || '').trim() || null;
		const body = {
			idViajero: idViajero,
			nombreViajero: nombreViajero,
			hotel: v.nombreHotel,
			habitacion: v.habitacion,
			direccion: v.direccion,
			fechaIngreso: v.checkIn,
			fechaSalida: v.checkOut,
		};

		const request$ = this.editandoId
			? this.svc.actualizarAlojamiento(idViaje, this.editandoId, body)
			: this.svc.asignarAlojamiento(idViaje, body);

		request$.subscribe({
			next: () => {
				this.enviando = false;
				this.showForm = false;
				this.mostrarToast(this.editandoId ? 'Alojamiento actualizado correctamente' : 'Alojamiento asignado correctamente');
				this.cargarViajes();
			},
			error: (err) => {
				this.enviando = false;
				const campos = err?.error?.campos;
				const detalle = campos && Object.keys(campos).length > 0
					? ': ' + Object.values(campos).join(', ') : '';
				this.mostrarToast(
					(err?.error?.mensaje || err?.error?.message || 'Error al guardar alojamiento') + detalle,
					'error'
				);
			}
		});
	}

	mostrarToast(msg: string, type: 'success' | 'error' = 'success'): void {
		this.toastMsg = msg; this.toastType = type; this.showToast = true;
		setTimeout(() => { this.showToast = false; }, 3500);
	}

	onCheckInSelected(date: string): void {
		this.showCalendarCheckIn = false;
		this.alojamientoForm.patchValue({ checkIn: date });
	}

	onCheckOutSelected(date: string): void {
		this.showCalendarCheckOut = false;
		this.alojamientoForm.patchValue({ checkOut: date });
	}
}
