import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { Viaje, InformacionMedica } from '../../../../models/operaciones.models';

interface Usuario { id: number; firstName: string; lastName: string; }

@Component({
  selector: 'app-medical-info',
  templateUrl: './medical-info.component.html',
  styleUrl: './medical-info.component.css',
})
export class InfoMedicaComponent implements OnInit {
  showForm = false;
  enviando = false;
  showToast = false;
  toastMsg = '';
  toastType: 'success' | 'error' = 'success';
  editando: InformacionMedica | null = null;

  viajes: Viaje[] = [];
  idViajeSeleccionado: number | null = null;
  registros: InformacionMedica[] = [];
  usuarios: Usuario[] = [];
  usuarioMap: Record<number, string> = {};
  paqueteTituloMap: Record<number, string> = {};

  gruposSanguineos = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  medForm = this.fb.group({
    nombreViajero:  ['', Validators.required],
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
        this.svc.getPaqueteTituloMap(viajes).subscribe(m => { this.paqueteTituloMap = m; });
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
      nombreViajero:  registro.nombreViajero || this.getNombreViajero(registro.idViajero),
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
    const idViaje = this.idViajeSeleccionado;
    if (!idViaje) {
      this.enviando = false;
      this.mostrarToast('Selecciona un viaje primero', 'error');
      return;
    }
    const idViajero = this.editando ? this.editando.idViajero : 1;
    const body = {
      idViaje:            idViaje,
      tipoSangre:         v.tipoSangre || '',
      alergias:           v.alergias || '',
      medicamentos:       v.medicamentos || '',
      condicionesMedicas: v.condiciones || '',
      telefonoMedico:     v.telefonoMedico || undefined,
      nombreViajero:      v.nombreViajero || '',
    };

    const request$ = this.editando
      ? this.svc.actualizarInformacionMedica(this.editando.idViajero, this.editando.id, body)
      : this.svc.registrarInformacionMedica(idViajero, body);

    request$.subscribe({
      next: () => {
        this.enviando = false;
        this.showForm = false;
        this.editando = null;
        this.mostrarToast('Informacion medica guardada correctamente');
        this.cargarRegistros();
      },
      error: (err) => {
        this.enviando = false;
        const campos = err?.error?.campos;
        const detalle = campos && Object.keys(campos).length > 0
          ? ': ' + Object.values(campos).join(', ') : '';
        this.mostrarToast(
          (err?.error?.mensaje || err?.error?.message || 'Error al guardar') + detalle,
          'error'
        );
      }
    });
  }

  eliminar(r: InformacionMedica): void {
    if (!confirm(`¿Eliminar el registro médico de ${this.getNombreViajero(r.idViajero)}?`)) return;
    this.svc.eliminarInformacionMedica(r.idViajero, r.id).subscribe({
      next: () => {
        this.mostrarToast('Registro médico eliminado');
        this.cargarRegistros();
      },
      error: () => { this.mostrarToast('Error al eliminar', 'error'); }
    });
  }

  mostrarToast(msg: string, type: 'success' | 'error' = 'success'): void {
    this.toastMsg = msg; this.toastType = type; this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 3500);
  }
}
