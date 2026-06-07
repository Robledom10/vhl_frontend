import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { Viaje, InformacionMedica } from '../../../../models/operaciones.models';

interface Usuario { id: number; firstName: string; lastName: string; }

@Component({
  selector: 'app-info-medica',
  templateUrl: './info-medica.component.html',
  styleUrl: './info-medica.component.css',
})
export class InfoMedicaComponent implements OnInit {
  showForm = false;
  enviando = false;
  showToast = false;
  toastMsg = '';
  editando: InformacionMedica | null = null;

  viajes: Viaje[] = [];
  idViajeSeleccionado: number | null = null;
  registros: InformacionMedica[] = [];
  usuarios: Usuario[] = [];
  usuarioMap: Record<number, string> = {};

  gruposSanguineos = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  medForm = this.fb.group({
    idViajero:      ['', Validators.required],
    tipoSangre:     ['', Validators.required],
    alergias:       [''],
    medicamentos:   [''],
    condiciones:    [''],
    telefonoMedico: ['', Validators.pattern(/^\+?[\d\s\-]{7,20}$/)],
  });

  constructor(
    private fb: FormBuilder,
    private svc: OperacionesService,
    private authSvc: AuthService
  ) {}

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
          this.cargarRegistros();
        }
      },
      error: () => {}
    });
  }

  getNombreViajero(idViajero: number): string {
    return this.usuarioMap[idViajero] || `Viajero #${idViajero}`;
  }

  onViajeChange(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    this.idViajeSeleccionado = id || null;
    this.registros = [];
    if (this.idViajeSeleccionado) this.cargarRegistros();
  }

  cargarRegistros(): void {
    if (!this.idViajeSeleccionado) return;
    this.svc.getInformacionMedica(this.idViajeSeleccionado).subscribe({
      next: (items) => { this.registros = items; },
      error: () => {}
    });
  }

  abrirNuevo(): void {
    this.editando = null;
    this.medForm.reset();
    this.showForm = true;
  }

  abrir(registro: InformacionMedica): void {
    this.editando = registro;
    this.medForm.patchValue({
      idViajero:      registro.idViajero.toString(),
      tipoSangre:     registro.tipoSangre,
      alergias:       registro.alergias,
      medicamentos:   registro.medicamentos,
      condiciones:    registro.condicionesMedicas,
      telefonoMedico: registro.telefonoMedico,
    });
    this.showForm = true;
  }

  cerrar(): void { this.showForm = false; this.editando = null; }

  guardar(): void {
    if (this.medForm.invalid) { this.medForm.markAllAsTouched(); return; }
    this.enviando = true;

    const v = this.medForm.value;
    const idViaje = this.idViajeSeleccionado || 1;
    const idViajero = this.editando ? this.editando.idViajero : Number(v.idViajero);
    const body = {
      idViaje:            idViaje,
      tipoSangre:         v.tipoSangre || '',
      alergias:           v.alergias || '',
      medicamentos:       v.medicamentos || '',
      condicionesMedicas: v.condiciones || '',
      telefonoMedico:     v.telefonoMedico || undefined,
    };

    const request$ = this.editando
      ? this.svc.actualizarInformacionMedica(this.editando.idViajero, this.editando.id, body)
      : this.svc.registrarInformacionMedica(idViajero, body);

    request$.subscribe({
      next: (result) => {
        if (this.editando) {
          const idx = this.registros.findIndex(r => r.id === this.editando!.id);
          if (idx !== -1) this.registros[idx] = result;
        } else {
          this.registros.push(result);
        }
        this.enviando = false;
        this.showForm = false;
        this.mostrarToast('Informacion medica guardada correctamente');
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
