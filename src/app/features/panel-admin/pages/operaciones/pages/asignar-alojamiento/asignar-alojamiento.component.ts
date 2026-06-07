import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { Viaje, Alojamiento } from '../../../../models/operaciones.models';

interface ViajeDisplay {
  id: number;
  nombre: string;
  destino: string;
  fecha: string;
  cupo: number;
  alojamientoAsignado: boolean;
}

@Component({
  selector: 'app-asignar-alojamiento',
  templateUrl: './asignar-alojamiento.component.html',
  styleUrl: './asignar-alojamiento.component.css',
})
export class AsignarAlojamientoComponent implements OnInit {
  showForm = false;
  enviando = false;
  showToast = false;
  toastMsg = '';
  viajeSeleccionado: ViajeDisplay | null = null;

  viajes: ViajeDisplay[] = [];

  alojamientoForm = this.fb.group({
    nombreHotel:  ['', [Validators.required, Validators.minLength(3)]],
    habitacion:   ['', Validators.required],
    direccion:    ['', Validators.required],
    checkIn:      ['', Validators.required],
    checkOut:     ['', Validators.required],
  });

  tiposHabitacion = ['Individual', 'Doble', 'Triple', 'Suite', 'Cabana'];

  constructor(private fb: FormBuilder, private svc: OperacionesService) {}

  ngOnInit(): void {
    this.cargarViajes();
  }

  cargarViajes(): void {
    this.svc.getViajes().subscribe({
      next: (viajes) => {
        const promises = viajes.map(v =>
          new Promise<ViajeDisplay>(resolve => {
            this.svc.getAlojamientos(v.id).subscribe({
              next: (aloj) => resolve(this.toDisplay(v, aloj)),
              error: () => resolve(this.toDisplay(v, []))
            });
          })
        );
        Promise.all(promises).then(items => { this.viajes = items; });
      },
      error: () => {}
    });
  }

  private toDisplay(v: Viaje, alojamientos: Alojamiento[]): ViajeDisplay {
    return {
      id: v.id,
      nombre: `Viaje #${v.id} — Paquete ${v.idPaquete}`,
      destino: `Paquete ${v.idPaquete}`,
      fecha: v.fechaSalida,
      cupo: alojamientos.length,
      alojamientoAsignado: alojamientos.length > 0,
    };
  }

  seleccionarViaje(viaje: ViajeDisplay): void {
    this.viajeSeleccionado = viaje;
    this.alojamientoForm.reset();
    this.showForm = true;
  }

  cerrarForm(): void { this.showForm = false; this.viajeSeleccionado = null; }

  guardar(): void {
    if (this.alojamientoForm.invalid) { this.alojamientoForm.markAllAsTouched(); return; }
    if (!this.viajeSeleccionado) return;
    this.enviando = true;

    const v = this.alojamientoForm.value;
    const body = {
      idViajero:    this.viajeSeleccionado.id,
      hotel:        v.nombreHotel,
      habitacion:   v.habitacion,
      direccion:    v.direccion,
      fechaIngreso: v.checkIn,
      fechaSalida:  v.checkOut,
    };

    this.svc.asignarAlojamiento(this.viajeSeleccionado.id, body).subscribe({
      next: () => {
        const idx = this.viajes.findIndex(x => x.id === this.viajeSeleccionado!.id);
        if (idx !== -1) this.viajes[idx].alojamientoAsignado = true;
        this.enviando = false;
        this.showForm = false;
        this.mostrarToast('Alojamiento asignado correctamente');
      },
      error: (err) => {
        this.enviando = false;
        this.mostrarToast(err?.error?.mensaje || 'Error al asignar alojamiento');
      }
    });
  }

  mostrarToast(msg: string): void {
    this.toastMsg = msg; this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 3000);
  }
}
