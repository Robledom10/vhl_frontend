import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

interface Comunicacion {
  id: number; viaje: string; destinatario: string; asunto: string;
  mensaje: string; fecha: string; tipo: 'grupal' | 'individual';
}

@Component({
  selector: 'app-comunicaciones',
  templateUrl: './comunicaciones.component.html',
  styleUrl: './comunicaciones.component.css',
})
export class ComunicacionesComponent {
  showForm = false;
  enviando = false;
  showToast = false;
  toastMsg = '';

  comunicaciones: Comunicacion[] = [
    { id: 1, viaje: 'Plan excursión 2026', destinatario: 'Todos los viajeros', asunto: 'Punto de encuentro mañana', mensaje: 'El bus saldrá desde la Terminal Norte a las 6:00 AM. Por favor estar 15 minutos antes.', fecha: '2026-06-04', tipo: 'grupal' },
    { id: 2, viaje: 'Plan vacacional Medellín', destinatario: 'Pedro López', asunto: 'Información sobre equipaje', mensaje: 'Su maleta fue localizada y llegará en el próximo vuelo.', fecha: '2026-06-05', tipo: 'individual' },
  ];

  viajes = ['Plan excursión 2026', 'Plan turístico Isla de Barú', 'Plan vacacional Medellín'];
  tiposDestinatario = ['Todos los viajeros', 'Carlos Martínez', 'Ana García', 'Pedro López'];

  comForm = this.fb.group({
    viaje: ['', Validators.required],
    destinatario: ['', Validators.required],
    asunto: ['', [Validators.required, Validators.minLength(5)]],
    mensaje: ['', [Validators.required, Validators.minLength(20)]],
    tipo: ['grupal', Validators.required],
  });

  constructor(private fb: FormBuilder) {}

  abrir(): void { this.comForm.reset({ tipo: 'grupal' }); this.showForm = true; }
  cerrar(): void { this.showForm = false; }

  enviar(): void {
    if (this.comForm.invalid) { this.comForm.markAllAsTouched(); return; }
    this.enviando = true;
    setTimeout(() => {
      const v = this.comForm.value;
      this.comunicaciones.unshift({ id: Date.now(), viaje: v.viaje!, destinatario: v.destinatario!, asunto: v.asunto!, mensaje: v.mensaje!, fecha: new Date().toISOString().split('T')[0], tipo: v.tipo as 'grupal' | 'individual' });
      this.enviando = false;
      this.showForm = false;
      this.mostrarToast('Comunicación enviada exitosamente');
    }, 800);
  }

  mostrarToast(msg: string): void {
    this.toastMsg = msg; this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 3000);
  }
}
