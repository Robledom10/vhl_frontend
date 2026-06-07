import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

interface Incidente {
  id: number; viaje: string; tipo: string; descripcion: string;
  fecha: string; estado: 'abierto' | 'en-proceso' | 'resuelto'; reportadoPor: string;
}

@Component({
  selector: 'app-incidentes',
  templateUrl: './incidentes.component.html',
  styleUrl: './incidentes.component.css',
})
export class IncidentesComponent {
  showForm = false;
  enviando = false;
  showToast = false;
  toastMsg = '';

  incidentes: Incidente[] = [
    { id: 1, viaje: 'Plan turístico Isla de Barú', tipo: 'Accidente leve', descripcion: 'Viajero se torció el tobillo durante caminata.', fecha: '2026-06-05', estado: 'en-proceso', reportadoPor: 'Guía Juan Pérez' },
    { id: 2, viaje: 'Plan vacacional Medellín', tipo: 'Pérdida de equipaje', descripcion: 'Maleta no llegó en vuelo de conexión.', fecha: '2026-06-04', estado: 'resuelto', reportadoPor: 'Op. Sara Barmar' },
  ];

  tiposIncidente = ['Accidente leve', 'Accidente grave', 'Pérdida de equipaje', 'Problema de salud', 'Retraso de transporte', 'Conflicto entre viajeros', 'Problema de alojamiento', 'Otro'];

  viajes = ['Plan excursión 2026', 'Plan turístico Isla de Barú', 'Plan vacacional Medellín'];

  incidenteForm = this.fb.group({
    viaje: ['', Validators.required],
    tipo: ['', Validators.required],
    descripcion: ['', [Validators.required, Validators.minLength(10)]],
    reportadoPor: ['', Validators.required],
  });

  constructor(private fb: FormBuilder) {}

  abrir(): void { this.incidenteForm.reset(); this.showForm = true; }
  cerrar(): void { this.showForm = false; }

  guardar(): void {
    if (this.incidenteForm.invalid) { this.incidenteForm.markAllAsTouched(); return; }
    this.enviando = true;
    setTimeout(() => {
      const v = this.incidenteForm.value;
      this.incidentes.unshift({ id: Date.now(), viaje: v.viaje!, tipo: v.tipo!, descripcion: v.descripcion!, fecha: new Date().toISOString().split('T')[0], estado: 'abierto', reportadoPor: v.reportadoPor! });
      this.enviando = false;
      this.showForm = false;
      this.mostrarToast('Incidente registrado correctamente');
    }, 700);
  }

  cambiarEstado(inc: Incidente): void {
    const ciclo: Record<string, 'abierto' | 'en-proceso' | 'resuelto'> = { 'abierto': 'en-proceso', 'en-proceso': 'resuelto', 'resuelto': 'abierto' };
    inc.estado = ciclo[inc.estado];
  }

  mostrarToast(msg: string): void {
    this.toastMsg = msg; this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 3000);
  }

  getEstadoLabel(estado: string): string {
    const map: Record<string, string> = { 'abierto': 'Abierto', 'en-proceso': 'En proceso', 'resuelto': 'Resuelto' };
    return map[estado] || estado;
  }
}
