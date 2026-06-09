import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { Viaje, Transporte } from '../../../../models/operaciones.models';

interface ViajeDisplay {
	idPaquete: number;
	id: number | null;
	nombre: string;
	titulo: string;
	destino: string;
	fecha: string;
	cupo: number;
	tieneViaje: boolean;
	transporteAsignado: boolean;
	transportes: Transporte[];
}

@Component({
	selector: 'app-assign-transport',
	templateUrl: './assign-transport.component.html',
	styleUrl: './assign-transport.component.css',
})
export class AsignarTransporteComponent implements OnInit {
	showForm = false;
	showDetalle = false;
	viajeDetalle: ViajeDisplay | null = null;
	enviando = false;
	showToast = false;
	toastMsg = '';
	toastType: 'success' | 'error' = 'success';
	viajeSeleccionado: ViajeDisplay | null = null;

	viajes: ViajeDisplay[] = [];
	editandoTransporteId: number | null = null;

	get viajesConViaje(): ViajeDisplay[] {
		return this.viajes.filter(v => v.tieneViaje);
	}

	transporteForm = this.fb.group({
		idViaje: [''],
		empresa: ['', [Validators.required, Validators.minLength(3)]],
		tipoVehiculo: ['', Validators.required],
		capacidad: ['', [Validators.required, Validators.min(1)]],
		cantidadViajeros: ['', [Validators.required, Validators.min(1)]],
		conductor: ['', [Validators.required, Validators.minLength(3)]],
		telefonoConductor: ['', [Validators.required, Validators.pattern(/^[+\d\s\-]{7,20}$/)]],
		horarioSalida: ['', Validators.required],
		placa: ['', [Validators.required, Validators.minLength(5)]],
	});

	tiposVehiculo = ['Buses Granada', 'Avión', 'Van', 'Minibus', 'Lancha', 'Otro'];

	constructor(private fb: FormBuilder, private svc: OperacionesService) { }

	ngOnInit(): void {
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
			transporteAsignado: false,
			transportes: [],
		};
	}

	private toDisplay(v: Viaje, transportes: Transporte[], titulo?: string, destino?: string): ViajeDisplay {
		const t = titulo || `Paquete ${v.idPaquete}`;
		return {
			idPaquete: v.idPaquete,
			id: v.id,
			nombre: `${t} — Viaje #${v.id}`,
			titulo: t,
			destino: destino || `Paquete ${v.idPaquete}`,
			fecha: v.fechaSalida,
			cupo: transportes[0]?.cantidadViajeros ?? 0,
			tieneViaje: true,
			transporteAsignado: transportes.length > 0,
			transportes,
		};
	}

	abrirNuevo(): void {
		this.viajeSeleccionado = null;
		this.editandoTransporteId = null;
		this.transporteForm.reset();
		this.showForm = true;
	}

	eliminar(viaje: ViajeDisplay): void {
		if (!viaje.id || !viaje.transportes.length) return;
		if (!confirm(`¿Eliminar el transporte asignado a ${viaje.titulo}?`)) return;
		const id = viaje.transportes[0].id;
		this.svc.eliminarTransporte(viaje.id, id).subscribe({
			next: () => {
				this.mostrarToast('Transporte eliminado');
				this.cargarViajes();
			},
			error: () => this.mostrarToast('Error al eliminar el transporte', 'error')
		});
	}

	seleccionarViaje(viaje: ViajeDisplay): void {
		this.viajeSeleccionado = viaje;
		this.transporteForm.reset();
		if (viaje.transporteAsignado && viaje.transportes.length > 0) {
			const t = viaje.transportes[0];
			this.editandoTransporteId = t.id;
			this.transporteForm.patchValue({
				tipoVehiculo: t.tipoTransporte,
				empresa: t.empresa,
				placa: t.placa,
				conductor: t.conductor,
				telefonoConductor: t.telefonoConductor,
				capacidad: String(t.capacidad),
				cantidadViajeros: String(t.cantidadViajeros),
				horarioSalida: t.fechaSalida ? t.fechaSalida.substring(0, 16) : '',
			});
		} else {
			this.editandoTransporteId = null;
		}
		this.showForm = true;
	}

	cerrarForm(): void { this.showForm = false; this.viajeSeleccionado = null; this.editandoTransporteId = null; }

	verDetalle(viaje: ViajeDisplay): void { this.viajeDetalle = viaje; this.showDetalle = true; }
	cerrarDetalle(): void { this.showDetalle = false; this.viajeDetalle = null; }

	guardar(): void {
		if (this.transporteForm.invalid) { this.transporteForm.markAllAsTouched(); return; }
		this.enviando = true;

		const v = this.transporteForm.value;
		const idViaje = this.viajeSeleccionado?.id || Number(v.idViaje);
		if (!idViaje) {
			this.enviando = false;
			this.mostrarToast('Selecciona un viaje', 'error');
			return;
		}
		const rawFecha = v.horarioSalida || '';
		const body = {
			tipoTransporte: v.tipoVehiculo,
			empresa: v.empresa,
			placa: v.placa,
			conductor: v.conductor,
			telefonoConductor: v.telefonoConductor,
			capacidad: Number(v.capacidad),
			cantidadViajeros: Number(v.cantidadViajeros),
			fechaSalida: rawFecha.length === 16 ? rawFecha + ':00' : rawFecha,
		};

		const request$ = this.editandoTransporteId
			? this.svc.actualizarTransporte(idViaje, this.editandoTransporteId, body)
			: this.svc.asignarTransporte(idViaje, body);
		const mensajeOk = this.editandoTransporteId ? 'Transporte actualizado correctamente' : 'Transporte asignado correctamente';

		request$.subscribe({
			next: () => {
				this.enviando = false;
				this.showForm = false;
				this.editandoTransporteId = null;
				this.mostrarToast(mensajeOk);
				this.cargarViajes();
			},
			error: (err) => {
				this.enviando = false;
				const campos = err?.error?.campos;
				const detalle = campos && Object.keys(campos).length > 0
					? ': ' + Object.values(campos).join(', ') : '';
				this.mostrarToast(
					(err?.error?.mensaje || err?.error?.message || 'Error al guardar transporte') + detalle,
					'error'
				);
			}
		});
	}

	mostrarToast(msg: string, type: 'success' | 'error' = 'success'): void {
		this.toastMsg = msg; this.toastType = type; this.showToast = true;
		setTimeout(() => { this.showToast = false; }, 3500);
	}

	capacidadSuficiente(): boolean {
		const cap = Number(this.transporteForm.get('capacidad')?.value || 0);
		const cant = Number(this.transporteForm.get('cantidadViajeros')?.value || 0);
		return cap >= cant;
	}
}
