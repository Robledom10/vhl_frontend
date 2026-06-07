import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { Viaje, Incidente } from '../../../../models/operaciones.models';

@Component({
  selector: 'app-incidentes',
  templateUrl: './incidentes.component.html',
  styleUrl: './incidentes.component.css',
})
export class IncidentesComponent implements OnInit {
  showForm = false;
  enviando = false;
  showToast = false;
  toastMsg = '';

  viajes: Viaje[] = [];
  idViajeSeleccionado: number | null = null;
  incidentes: Incidente[] = [];

  tiposIncidente = [
    'Accidente leve', 'Accidente grave', 'Perdida de equipaje',
    'Problema de salud', 'Retraso de transporte',
    'Conflicto entre viajeros', 'Problema de alojamiento', 'Otro'
  ];

  severidades = ['BAJO', 'MEDIO', 'ALTO', 'CRITICO'];

  incidenteForm = this.fb.group({
    idViaje:     ['', Validators.required],
    tipo:        ['', Validators.required],
    descripcion: ['', [Validators.required, Validators.minLength(10)]],
    severidad:   ['', Validators.required],
    reportadoPor:['', Validators.required],
    idViajero:   [''],
  });

  constructor(private fb: FormBuilder, private svc: OperacionesService) {}

  ngOnInit(): void {
    this.svc.getViajes().subscribe({
      next: (viajes) => {
        this.viajes = viajes;
        if (viajes.length > 0) {
          this.idViajeSeleccionado = viajes[0].id;
          this.cargarIncidentes();
        }
      },
      error: () => {}
    });
  }

  onViajeChange(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    this.idViajeSeleccionado = id || null;
    this.incidentes = [];
    if (this.idViajeSeleccionado) this.cargarIncidentes();
  }

  cargarIncidentes(): void {
    if (!this.idViajeSeleccionado) return;
    this.svc.getIncidentes(this.idViajeSeleccionado).subscribe({
      next: (items) => { this.incidentes = items; },
      error: () => {}
    });
  }

  abrir(): void {
    this.incidenteForm.reset({ idViaje: this.idViajeSeleccionado?.toString() || '' });
    this.showForm = true;
  }
  cerrar(): void { this.showForm = false; }

  guardar(): void {
    if (this.incidenteForm.invalid) { this.incidenteForm.markAllAsTouched(); return; }
    this.enviando = true;

    const v = this.incidenteForm.value;
    const idViaje = Number(v.idViaje);
    const body = {
      tipo:        v.tipo || '',
      descripcion: v.descripcion || '',
      severidad:   v.severidad || 'MEDIO',
      reportadoPor:v.reportadoPor || '',
      idViajero:   v.idViajero ? Number(v.idViajero) : null,
    };

    this.svc.registrarIncidente(idViaje, body).subscribe({
      next: (result) => {
        this.incidentes.unshift(result);
        this.enviando = false;
        this.showForm = false;
        this.mostrarToast('Incidente registrado correctamente');
      },
      error: (err) => {
        this.enviando = false;
        this.mostrarToast(err?.error?.mensaje || 'Error al registrar incidente');
      }
    });
  }

  cambiarEstado(inc: Incidente): void {
    const ciclo: Record<string, string> = {
      'pendiente':   'en-proceso',
      'en-proceso':  'resuelto',
      'resuelto':    'pendiente'
    };
    const nuevoEstado = ciclo[inc.estado] || 'pendiente';
    this.svc.actualizarEstadoIncidente(inc.id, nuevoEstado).subscribe({
      next: (result) => {
        const idx = this.incidentes.findIndex(i => i.id === inc.id);
        if (idx !== -1) this.incidentes[idx] = result;
        this.mostrarToast('Estado actualizado');
      },
      error: (err) => {
        this.mostrarToast(err?.error?.mensaje || 'Error al actualizar estado');
      }
    });
  }

  mostrarToast(msg: string): void {
    this.toastMsg = msg; this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 3000);
  }

  getEstadoLabel(estado: string): string {
    const map: Record<string, string> = {
      'pendiente': 'Pendiente', 'en-proceso': 'En proceso', 'resuelto': 'Resuelto'
    };
    return map[estado] || estado;
  }
}
