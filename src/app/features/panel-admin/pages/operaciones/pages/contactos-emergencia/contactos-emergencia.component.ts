import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { Viaje, ContactoEmergencia } from '../../../../models/operaciones.models';

interface Usuario { id: number; firstName: string; lastName: string; }

@Component({
  selector: 'app-contactos-emergencia',
  templateUrl: './contactos-emergencia.component.html',
  styleUrl: './contactos-emergencia.component.css',
})
export class ContactosEmergenciaComponent implements OnInit {
  showForm = false;
  enviando = false;
  showToast = false;
  toastMsg = '';
  editando: ContactoEmergencia | null = null;

  viajes: Viaje[] = [];
  idViajeSeleccionado: number | null = null;
  contactos: ContactoEmergencia[] = [];
  usuarios: Usuario[] = [];
  usuarioMap: Record<number, string> = {};

  relaciones = ['Padre/Madre', 'Esposo/a', 'Hijo/a', 'Hermano/a', 'Amigo/a', 'Otro'];

  contactoForm = this.fb.group({
    idViajero:      ['', Validators.required],
    nombreContacto: ['', [Validators.required, Validators.minLength(3)]],
    relacion:       ['', Validators.required],
    telefono:       ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-]{7,20}$/)]],
    correo:         ['', Validators.email],
  });

  constructor(private fb: FormBuilder, private svc: OperacionesService, private authSvc: AuthService) {}

  getNombreViajero(id: number): string {
    return this.usuarioMap[id] || `Viajero #${id}`;
  }

  ngOnInit(): void {
    this.authSvc.getAllUsers().subscribe({
      next: (users: any[]) => {
        this.usuarios = users.map(u => ({ id: u.id, firstName: u.firstName, lastName: u.lastName }));
        this.usuarioMap = Object.fromEntries(this.usuarios.map(u => [u.id, `${u.firstName} ${u.lastName}`]));
      },
      error: () => {}
    });

    this.svc.getViajes().subscribe({
      next: (viajes) => {
        this.viajes = viajes;
        if (viajes.length > 0) {
          this.idViajeSeleccionado = viajes[0].id;
          this.cargarContactos();
        }
      },
      error: () => {}
    });
  }

  onViajeChange(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    this.idViajeSeleccionado = id || null;
    this.contactos = [];
    if (this.idViajeSeleccionado) this.cargarContactos();
  }

  cargarContactos(): void {
    if (!this.idViajeSeleccionado) return;
    this.svc.getContactos(this.idViajeSeleccionado).subscribe({
      next: (items) => { this.contactos = items; },
      error: () => {}
    });
  }

  abrirNuevo(): void {
    this.editando = null;
    this.contactoForm.reset();
    this.showForm = true;
  }

  abrir(contacto: ContactoEmergencia): void {
    this.editando = contacto;
    this.contactoForm.patchValue({
      nombreContacto: contacto.nombre,
      relacion:       contacto.parentesco,
      telefono:       contacto.telefono,
      correo:         contacto.correo,
    });
    this.showForm = true;
  }

  cerrar(): void { this.showForm = false; this.editando = null; }

  guardar(): void {
    if (this.contactoForm.invalid) { this.contactoForm.markAllAsTouched(); return; }
    this.enviando = true;

    const v = this.contactoForm.value;
    const idViaje = this.idViajeSeleccionado || 1;
    const idViajero = this.editando ? this.editando.idViajero : Number(v.idViajero);
    const body = {
      idViaje:    idViaje,
      nombre:     v.nombreContacto || '',
      parentesco: v.relacion || '',
      telefono:   v.telefono || '',
      correo:     v.correo || undefined,
    };

    const request$ = this.editando
      ? this.svc.actualizarContacto(this.editando.idViajero, this.editando.id, body)
      : this.svc.registrarContacto(idViajero, body);

    request$.subscribe({
      next: (result) => {
        if (this.editando) {
          const idx = this.contactos.findIndex(c => c.id === this.editando!.id);
          if (idx !== -1) this.contactos[idx] = result;
        } else {
          this.contactos.push(result);
        }
        this.enviando = false;
        this.showForm = false;
        this.mostrarToast('Contacto de emergencia guardado correctamente');
      },
      error: (err) => {
        this.enviando = false;
        this.mostrarToast(err?.error?.mensaje || 'Error al guardar');
      }
    });
  }

  mostrarToast(msg: string): void {
    this.toastMsg = msg; this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 3000);
  }
}
