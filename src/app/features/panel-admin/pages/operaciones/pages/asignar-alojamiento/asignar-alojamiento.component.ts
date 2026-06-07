import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

interface ViajeAloj {
  id: number; nombre: string; destino: string; fecha: string;
  cupo: number; alojamientoAsignado: boolean;
}

@Component({
  selector: 'app-asignar-alojamiento',
  templateUrl: './asignar-alojamiento.component.html',
  styleUrl: './asignar-alojamiento.component.css',
})
export class AsignarAlojamientoComponent {
  showForm = false;
  enviando = false;
  showToast = false;
  toastMsg = '';
  viajeSeleccionado: ViajeAloj | null = null;

  viajes: ViajeAloj[] = [
    { id: 1, nombre: 'Plan excursión 2026', destino: 'Santa Marta', fecha: '2026-06-09', cupo: 4, alojamientoAsignado: false },
    { id: 2, nombre: 'Plan turístico Isla de Barú', destino: 'Isla de Barú', fecha: '2026-06-23', cupo: 4, alojamientoAsignado: false },
    { id: 3, nombre: 'Plan vacacional Medellín', destino: 'Medellín', fecha: '2026-06-10', cupo: 12, alojamientoAsignado: true },
  ];

  alojamientoForm = this.fb.group({
    nombreHotel: ['', [Validators.required, Validators.minLength(3)]],
    direccion: ['', Validators.required],
    tipoHabitacion: ['', Validators.required],
    numHabitaciones: ['', [Validators.required, Validators.min(1)]],
    checkIn: ['', Validators.required],
    checkOut: ['', Validators.required],
    contactoHotel: ['', Validators.required],
  });

  tiposHabitacion = ['Individual', 'Doble', 'Triple', 'Suite', 'Cabaña'];

  constructor(private fb: FormBuilder) {}

  seleccionarViaje(viaje: ViajeAloj): void {
    this.viajeSeleccionado = viaje;
    this.alojamientoForm.reset();
    this.showForm = true;
  }

  cerrarForm(): void { this.showForm = false; this.viajeSeleccionado = null; }

  guardar(): void {
    if (this.alojamientoForm.invalid) { this.alojamientoForm.markAllAsTouched(); return; }
    this.enviando = true;
    setTimeout(() => {
      const idx = this.viajes.findIndex(v => v.id === this.viajeSeleccionado!.id);
      if (idx !== -1) this.viajes[idx].alojamientoAsignado = true;
      this.enviando = false;
      this.showForm = false;
      this.mostrarToast('Alojamiento asignado correctamente');
    }, 800);
  }

  mostrarToast(msg: string): void {
    this.toastMsg = msg; this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 3000);
  }
}
