import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { Viaje, Transporte } from '../../../../models/operaciones.models';

interface ViajeDisplay {
  id: number;
  nombre: string;
  destino: string;
  fecha: string;
  cupo: number;
  transporteAsignado: boolean;
  transportes: Transporte[];
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
  viajeSeleccionado: ViajeDisplay | null = null;

  viajes: ViajeDisplay[] = [];
  editandoTransporteId: number | null = null;

  transporteForm = this.fb.group({
    empresa:           ['', [Validators.required, Validators.minLength(3)]],
    tipoVehiculo:      ['', Validators.required],
    capacidad:         ['', [Validators.required, Validators.min(1)]],
    cantidadViajeros:  ['', [Validators.required, Validators.min(1)]],
    conductor:         ['', [Validators.required, Validators.minLength(3)]],
    telefonoConductor: ['', [Validators.required, Validators.pattern(/^[+\d\s\-]{7,20}$/)]],
    horarioSalida:     ['', Validators.required],
    placa:             ['', [Validators.required, Validators.minLength(5)]],
  });

  tiposVehiculo = ['Buses Granada', 'Avión', 'Van', 'Minibus', 'Lancha', 'Otro'];

  constructor(private fb: FormBuilder, private svc: OperacionesService) {}

  ngOnInit(): void {
    this.cargarViajes();
  }

  cargarViajes(): void {
    this.svc.getViajes().subscribe({
      next: (viajes) => {
        const promises = viajes.map(v =>
          new Promise<ViajeDisplay>(resolve => {
            this.svc.getTransportes(v.id).subscribe({
              next: (transportes) => resolve(this.toDisplay(v, transportes)),
              error: () => resolve(this.toDisplay(v, []))
            });
          })
        );
        Promise.all(promises).then(items => { this.viajes = items; });
      },
      error: () => {}
    });
  }

  private toDisplay(v: Viaje, transportes: Transporte[]): ViajeDisplay {
    return {
      id: v.id,
      nombre: `Viaje #${v.id} — Paquete ${v.idPaquete}`,
      destino: `Paquete ${v.idPaquete}`,
      fecha: v.fechaSalida,
      cupo: transportes[0]?.cantidadViajeros ?? 0,
      transporteAsignado: transportes.length > 0,
      transportes,
    };
  }

  seleccionarViaje(viaje: ViajeDisplay): void {
    this.viajeSeleccionado = viaje;
    this.transporteForm.reset();
    if (viaje.transporteAsignado && viaje.transportes.length > 0) {
      const t = viaje.transportes[0];
      this.editandoTransporteId = t.id;
      this.transporteForm.patchValue({
        tipoVehiculo:      t.tipoTransporte,
        empresa:           t.empresa,
        placa:             t.placa,
        conductor:         t.conductor,
        telefonoConductor: t.telefonoConductor,
        capacidad:         String(t.capacidad),
        cantidadViajeros:  String(t.cantidadViajeros),
        horarioSalida:     t.fechaSalida ? t.fechaSalida.substring(0, 16) : '',
      });
    } else {
      this.editandoTransporteId = null;
    }
    this.showForm = true;
  }

  cerrarForm(): void { this.showForm = false; this.viajeSeleccionado = null; this.editandoTransporteId = null; }

  guardar(): void {
    if (this.transporteForm.invalid) { this.transporteForm.markAllAsTouched(); return; }
    if (!this.viajeSeleccionado) return;
    this.enviando = true;

    const v = this.transporteForm.value;
    const body = {
      tipoTransporte:    v.tipoVehiculo,
      empresa:           v.empresa,
      placa:             v.placa,
      conductor:         v.conductor,
      telefonoConductor: v.telefonoConductor,
      capacidad:         Number(v.capacidad),
      cantidadViajeros:  Number(v.cantidadViajeros),
      fechaSalida:       v.horarioSalida,
    };

    const idViaje = this.viajeSeleccionado.id;
    const request$ = this.editandoTransporteId
      ? this.svc.actualizarTransporte(idViaje, this.editandoTransporteId, body)
      : this.svc.asignarTransporte(idViaje, body);
    const mensajeOk = this.editandoTransporteId ? 'Transporte actualizado correctamente' : 'Transporte asignado correctamente';

    request$.subscribe({
      next: (result) => {
        const idx = this.viajes.findIndex(x => x.id === idViaje);
        if (idx !== -1) {
          this.viajes[idx].transporteAsignado = true;
          this.viajes[idx].transportes = [result];
        }
        this.enviando = false;
        this.showForm = false;
        this.editandoTransporteId = null;
        this.mostrarToast(mensajeOk);
      },
      error: (err) => {
        this.enviando = false;
        this.mostrarToast(err?.error?.mensaje || 'Error al guardar transporte');
      }
    });
  }

  mostrarToast(msg: string): void {
    this.toastMsg = msg; this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 3000);
  }

  capacidadSuficiente(): boolean {
    const cap = Number(this.transporteForm.get('capacidad')?.value || 0);
    const cant = Number(this.transporteForm.get('cantidadViajeros')?.value || 0);
    return cap >= cant;
  }
}
