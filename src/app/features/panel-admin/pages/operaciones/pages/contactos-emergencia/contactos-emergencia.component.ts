import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

interface ContactoEmergencia {
  id: number; viajero: string; nombreContacto: string; relacion: string;
  telefono: string; telefonoAlt: string;
}

@Component({
  selector: 'app-contactos-emergencia',
  templateUrl: './contactos-emergencia.component.html',
  styleUrl: './contactos-emergencia.component.css',
})
export class ContactosEmergenciaComponent {
  showForm = false;
  enviando = false;
  showToast = false;
  toastMsg = '';
  editando: ContactoEmergencia | null = null;

  contactos: ContactoEmergencia[] = [
    { id: 1, viajero: 'Carlos Martínez', nombreContacto: 'María Martínez', relacion: 'Madre', telefono: '+57 300 111 2222', telefonoAlt: '+57 604 222 3333' },
    { id: 2, viajero: 'Ana García', nombreContacto: 'Luis García', relacion: 'Esposo', telefono: '+57 315 444 5555', telefonoAlt: '' },
    { id: 3, viajero: 'Pedro López', nombreContacto: 'Sandra López', relacion: 'Hermana', telefono: '+57 318 666 7777', telefonoAlt: '+57 601 888 9999' },
  ];

  relaciones = ['Padre/Madre', 'Esposo/a', 'Hijo/a', 'Hermano/a', 'Amigo/a', 'Otro'];

  contactoForm = this.fb.group({
    nombreContacto: ['', [Validators.required, Validators.minLength(3)]],
    relacion: ['', Validators.required],
    telefono: ['', [Validators.required, Validators.pattern(/^[+\d\s\-]{7,20}$/)]],
    telefonoAlt: [''],
  });

  constructor(private fb: FormBuilder) {}

  abrir(contacto: ContactoEmergencia): void {
    this.editando = contacto;
    this.contactoForm.patchValue({ nombreContacto: contacto.nombreContacto, relacion: contacto.relacion, telefono: contacto.telefono, telefonoAlt: contacto.telefonoAlt });
    this.showForm = true;
  }

  cerrar(): void { this.showForm = false; this.editando = null; }

  guardar(): void {
    if (this.contactoForm.invalid) { this.contactoForm.markAllAsTouched(); return; }
    this.enviando = true;
    setTimeout(() => {
      if (this.editando) {
        const idx = this.contactos.findIndex(c => c.id === this.editando!.id);
        if (idx !== -1) {
          const v = this.contactoForm.value;
          this.contactos[idx] = { ...this.contactos[idx], nombreContacto: v.nombreContacto!, relacion: v.relacion!, telefono: v.telefono!, telefonoAlt: v.telefonoAlt || '' };
        }
      }
      this.enviando = false;
      this.showForm = false;
      this.mostrarToast('Contacto de emergencia actualizado');
    }, 700);
  }

  mostrarToast(msg: string): void {
    this.toastMsg = msg; this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 3000);
  }
}
