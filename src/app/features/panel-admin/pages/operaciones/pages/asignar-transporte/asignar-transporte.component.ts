import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

interface ViajeDisponible {
  id: number;
  nombre: string;
  destino: string;
  fecha: string;
  cupo: number;
  transporteAsignado: boolean;
}

@Component({
  selector: 'app-asignar-transporte',
  templateUrl: './asignar-transporte.component.html',
  styleUrl: './asignar-transporte.component.css',
})
export class AsignarTransporteComponent implements OnInit {
  showForm = false;
  enviando = false;
  showToast = false;
  toastMsg = '';
  viajeSeleccionado: ViajeDisponible | null = null;

  viajes: ViajeDisponible[] = [
    { id: 1, nombre: 'Plan excursión 2026', destino: 'Santa Marta', fecha: '2026-06-09', cupo: 4, transporteAsignado: true },
    { id: 2, nombre: 'Plan turístico Isla de Barú', destino: 'Isla de Barú', fecha: '2026-06-23', cupo: 4, transporteAsignado: false },
    { id: 3, nombre: 'Plan vacacional Medellín', destino: 'Medellín', fecha: '2026-06-10', cupo: 12, transporteAsignado: false },
  ];

  transporteForm = this.fb.group({
    empresa: ['', [Validators.required, Validators.minLength(3)]],
    tipoVehiculo: ['', Validators.required],
    capacidad: ['', [Validators.required, Validators.min(1)]],
    horarioSalida: ['', Validators.required],
    horarioRegreso: ['', Validators.required],
    placa: ['', [Validators.required, Validators.minLength(5)]],
  });

  tiposVehiculo = ['Bus de turismo', 'Van', 'Minibus', 'Avión', 'Lancha'];

  constructor(private fb: FormBuilder) {}
  ngOnInit(): void {}

  seleccionarViaje(viaje: ViajeDisponible): void {
    this.viajeSeleccionado = viaje;
    this.transporteForm.reset();
    this.showForm = true;
  }

  cerrarForm(): void {
    this.showForm = false;
    this.viajeSeleccionado = null;
  }

  guardar(): void {
    if (this.transporteForm.invalid) { this.transporteForm.markAllAsTouched(); return; }
    this.enviando = true;
    setTimeout(() => {
      if (this.viajeSeleccionado) {
        const idx = this.viajes.findIndex(v => v.id === this.viajeSeleccionado!.id);
        if (idx !== -1) this.viajes[idx].transporteAsignado = true;
      }
      this.enviando = false;
      this.showForm = false;
      this.mostrarToast('Transporte asignado correctamente');
    }, 800);
  }

  mostrarToast(msg: string): void {
    this.toastMsg = msg;
    this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 3000);
  }

  capacidadSuficiente(): boolean {
    const cap = Number(this.transporteForm.get('capacidad')?.value || 0);
    return cap >= (this.viajeSeleccionado?.cupo || 0);
  }
}
