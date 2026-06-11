import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { PackageService } from '../../../../../../core/services/package.service';
import { RespuestaProveedor } from '../../../../models/package.model';
import { Viaje, Restaurante } from '../../../../models/operaciones.models';

interface ViajeDisplay {
  id: number | null;
  idPaquete: number;
  nombre: string;
  titulo: string;
  destino: string;
  fecha: string;
  tieneViaje: boolean;
  restaurantes: Restaurante[];
}

@Component({
  selector: 'app-assign-restaurant',
  templateUrl: './assign-restaurant.component.html',
  styleUrl: './assign-restaurant.component.css',
})
export class AsignarRestauranteComponent implements OnInit {
  showForm = false;
  enviando = false;
  showToast = false;
  toastMsg = '';
  toastType: 'success' | 'error' = 'success';
  viajeSeleccionado: ViajeDisplay | null = null;
  editandoId: number | null = null;

  viajes: ViajeDisplay[] = [];
  proveedoresRestaurante: RespuestaProveedor[] = [];

  tiposComida = ['Típica', 'Internacional', 'Mariscos', 'Vegetariana', 'Desayunos', 'Buffet', 'Otro'];

  get viajesConViaje(): ViajeDisplay[] {
    return this.viajes.filter(v => v.tieneViaje);
  }

  restauranteForm = this.fb.group({
    idViaje:           [''],
    nombreRestaurante: ['', [Validators.required, Validators.minLength(3)]],
    direccion:         [''],
    telefono:          ['', [Validators.pattern(/^\+?[\d\s\-]{7,20}$/)]],
    tipoComida:        [''],
    notas:             ['', [Validators.maxLength(500)]],
  });

  constructor(private fb: FormBuilder, private svc: OperacionesService, private pkgSvc: PackageService) {}

  ngOnInit(): void {
    this.pkgSvc.getProveedoresByTipo('Restaurante').subscribe({
      next: items => { this.proveedoresRestaurante = items; },
      error: () => {}
    });
    this.cargarViajes();
  }

  seleccionarProveedor(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    if (!id) return;
    const p = this.proveedoresRestaurante.find(x => x.id === id);
    if (!p) return;
    this.restauranteForm.patchValue({
      nombreRestaurante: p.nombre,
      telefono:          p.telefono   || '',
      direccion:         p.direccion  || '',
      tipoComida:        p.tipoComida || '',
      notas:             p.notas      || '',
    });
  }

  cargarViajes(): void {
    forkJoin({
      paquetes: this.svc.getAllPaquetes().pipe(catchError(() => of([]))),
      viajes:   this.svc.getViajes().pipe(catchError(() => of([]))),
    }).pipe(
      switchMap(({ paquetes, viajes }) => {
        if (viajes.length === 0) return of(paquetes.map(p => this.toDisplaySinViaje(p)));
        return forkJoin(
          viajes.map(v =>
            this.svc.getRestaurantes(v.id).pipe(
              catchError(() => of([])),
              map(rests => this.toDisplay(v, rests as Restaurante[],
                paquetes.find(p => p.id === v.idPaquete)?.titulo,
                paquetes.find(p => p.id === v.idPaquete)?.destino))
            )
          )
        ).pipe(
          map(rows => {
            const conViaje = new Set(viajes.map(v => v.idPaquete));
            return [...rows, ...paquetes.filter(p => !conViaje.has(p.id)).map(p => this.toDisplaySinViaje(p))];
          })
        );
      })
    ).subscribe({ next: items => { this.viajes = [...items]; }, error: () => {} });
  }

  private toDisplaySinViaje(p: any): ViajeDisplay {
    return { id: null, idPaquete: p.id, nombre: p.titulo, titulo: p.titulo, destino: p.destino, fecha: '', tieneViaje: false, restaurantes: [] };
  }

  private toDisplay(v: Viaje, restaurantes: Restaurante[], titulo?: string, destino?: string): ViajeDisplay {
    const t = titulo || `Paquete ${v.idPaquete}`;
    return { id: v.id, idPaquete: v.idPaquete, nombre: `${t} — Viaje #${v.id}`, titulo: t, destino: destino || '', fecha: v.fechaSalida, tieneViaje: true, restaurantes };
  }

  asignarDesdeProveedor(p: RespuestaProveedor): void {
    this.viajeSeleccionado = null;
    this.editandoId = null;
    this.restauranteForm.reset();
    this.restauranteForm.patchValue({
      nombreRestaurante: p.nombre,
      telefono:          p.telefono   || '',
      direccion:         p.direccion  || '',
      tipoComida:        p.tipoComida || '',
      notas:             p.notas      || '',
    });
    this.showForm = true;
  }

  seleccionarViaje(viaje: ViajeDisplay): void {
    this.viajeSeleccionado = viaje;
    this.editandoId = null;
    this.restauranteForm.reset();
    this.showForm = true;
  }

  editar(viaje: ViajeDisplay, r: Restaurante): void {
    this.viajeSeleccionado = viaje;
    this.editandoId = r.id;
    this.restauranteForm.patchValue({ nombreRestaurante: r.nombreRestaurante, direccion: r.direccion || '', telefono: r.telefono || '', tipoComida: r.tipoComida || '', notas: r.notas || '' });
    this.showForm = true;
  }

  eliminar(viaje: ViajeDisplay, r: Restaurante): void {
    if (!viaje.id) return;
    if (!confirm(`¿Eliminar ${r.nombreRestaurante}?`)) return;
    this.svc.eliminarRestaurante(viaje.id, r.id).subscribe({
      next: () => { this.mostrarToast('Restaurante eliminado'); this.cargarViajes(); },
      error: () => this.mostrarToast('Error al eliminar', 'error')
    });
  }

  cerrar(): void { this.showForm = false; this.viajeSeleccionado = null; this.editandoId = null; }

  guardar(): void {
    if (this.restauranteForm.invalid) { this.restauranteForm.markAllAsTouched(); return; }
    const idViaje = this.viajeSeleccionado?.id || Number(this.restauranteForm.value.idViaje);
    if (!idViaje) { this.mostrarToast('Selecciona un viaje', 'error'); return; }
    this.enviando = true;
    const v = this.restauranteForm.value;
    const body = { nombreRestaurante: v.nombreRestaurante, direccion: v.direccion || null, telefono: v.telefono || null, tipoComida: v.tipoComida || null, notas: v.notas || null };
    const req$ = this.editandoId
      ? this.svc.actualizarRestaurante(idViaje, this.editandoId, body)
      : this.svc.asignarRestaurante(idViaje, body);
    req$.subscribe({
      next: () => { this.enviando = false; this.showForm = false; this.mostrarToast(this.editandoId ? 'Restaurante actualizado' : 'Restaurante asignado correctamente'); this.cargarViajes(); },
      error: (err) => { this.enviando = false; this.mostrarToast(err?.error?.mensaje || 'Error al guardar', 'error'); }
    });
  }

  mostrarToast(msg: string, type: 'success' | 'error' = 'success'): void {
    this.toastMsg = msg; this.toastType = type; this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 3500);
  }
}
