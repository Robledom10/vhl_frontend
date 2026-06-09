import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
} from '@angular/animations';
import { Reservation } from '../../models/reservations.models';

// ─── Modelos ──────────────────────────────────────────────────

export interface Acompanante {
  nombre: string;
  fechaNacimiento: string;
  tipoDocumento: string;
  documento: string;
}

export interface ReservationForm {
  clienteNombre: string;
  tipoDocumento: string;
  documento: string;
  clienteEmail: string;
  clienteTelefono: string;
  ciudadResidencia: string;
  personas: number | '';
  acompanantes: Acompanante[];
  paqueteNombre: string;
  destino: string;
  fechaSalida: string;
  fechaRegreso: string;
  duracion: string;
  tipoHabitacion: string;
  solicitudEspecial: string;
  notas: string;
  metodoPago: string;
  estadoPago: string;
  total: number | '';
  comprobante: string;
  aceptaTerminos: boolean;
  aceptaPolitica: boolean;
}

export interface PaqueteOption {
  nombre: string;
  destino: string;
  precio: number;
}

// ─── Animaciones ─────────────────────────────────────────────

const slideIn = trigger('slideIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.96) translateY(16px)' }),
    animate(
      '320ms cubic-bezier(.4,0,.2,1)',
      style({ opacity: 1, transform: 'scale(1) translateY(0)' })
    ),
  ]),
]);

const fadeStep = trigger('fadeStep', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(18px)' }),
    animate('260ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
  ]),
  transition(':leave', [
    animate('180ms ease-in', style({ opacity: 0, transform: 'translateX(-18px)' })),
  ]),
]);

const expandDown = trigger('expandDown', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(-10px)' }),
    animate('280ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' })),
  ]),
]);

// ─── Componente ───────────────────────────────────────────────

@Component({
  selector: 'app-form-reservation-creation',
  templateUrl: './form-reservations-creation.component.html',
  styleUrl: './form-reservations-creation.component.css',
  animations: [slideIn, fadeStep, expandDown],
})
export class FormReservationsCreationComponent implements OnChanges {

  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();
  @Output() reservationCreated = new EventEmitter<Reservation>();

  currentStep = 1;
  steps = ['Datos del cliente', 'Datos del viaje', 'Pago y confirmación'];
  submitted = false;

  paquetesDisponibles: PaqueteOption[] = [
    { nombre: 'Tour Medellín',        destino: 'Medellín',    precio: 850000  },
    { nombre: 'Tour Cartagena',       destino: 'Cartagena',   precio: 1200000 },
    { nombre: 'Tour San Andrés',      destino: 'San Andrés',  precio: 3200000 },
    { nombre: 'Tour Santa Marta',     destino: 'Santa Marta', precio: 4800000 },
    { nombre: 'Tour Parque del Café', destino: 'Quindío',     precio: 1800000 },
    { nombre: 'Tour Piscilago',       destino: 'Piscilago',   precio: 320000  },
  ];

  form: ReservationForm = this.emptyForm();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true) {
      this.resetForm();
    }
  }

  nextStep(): void {
    this.submitted = true;
    if (!this.validateStep(this.currentStep)) return;
    this.submitted = false;
    if (this.currentStep < 3) this.currentStep++;
  }

  prevStep(): void {
    this.submitted = false;
    if (this.currentStep > 1) this.currentStep--;
  }

  private validateStep(step: number): boolean {
    if (step === 1) {
      const base =
        !!this.form.clienteNombre &&
        !!this.form.tipoDocumento &&
        !!this.form.documento &&
        !!this.form.clienteEmail &&
        !!this.form.clienteTelefono &&
        !!this.form.ciudadResidencia &&
        this.form.personas !== '';

      if (!base) return false;

      if (Number(this.form.personas) > 1) {
        return this.form.acompanantes.every(
          a => !!a.nombre && !!a.fechaNacimiento && !!a.tipoDocumento && !!a.documento
        );
      }
      return true;
    }

    if (step === 2) {
      return (
        !!this.form.paqueteNombre &&
        !!this.form.fechaSalida &&
        !!this.form.fechaRegreso &&
        !!this.form.tipoHabitacion
      );
    }

    if (step === 3) {
      return (
        !!this.form.metodoPago &&
        !!this.form.estadoPago &&
        this.form.total !== '' &&
        this.form.aceptaTerminos &&
        this.form.aceptaPolitica
      );
    }

    return true;
  }

  onPersonasChange(value: number | ''): void {
    if (value === '' || Number(value) <= 1) {
      this.form.acompanantes = [];
      return;
    }
    const count = Number(value) - 1;
    const current = this.form.acompanantes.length;

    if (count > current) {
      for (let i = current; i < count; i++) {
        this.form.acompanantes.push(this.emptyAcompanante());
      }
    } else {
      this.form.acompanantes = this.form.acompanantes.slice(0, count);
    }
  }

  onPaqueteChange(nombrePaquete: string): void {
    const pkg = this.paquetesDisponibles.find(p => p.nombre === nombrePaquete);
    if (pkg) {
      this.form.destino = pkg.destino;
      const personas = this.form.personas ? Number(this.form.personas) : 1;
      this.form.total = pkg.precio * personas;
    } else {
      this.form.destino = '';
    }
  }

  calcDuracion(): void {
    if (!this.form.fechaSalida || !this.form.fechaRegreso) {
      this.form.duracion = '';
      return;
    }
    const salida  = new Date(this.form.fechaSalida);
    const regreso = new Date(this.form.fechaRegreso);
    const diff = Math.ceil(
      (regreso.getTime() - salida.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diff <= 0) {
      this.form.duracion = '';
      return;
    }
    this.form.duracion = `${diff} ${diff === 1 ? 'día' : 'días'}`;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.form.comprobante = input.files[0].name;
    }
  }

  confirm(): void {
    this.submitted = true;
    if (!this.validateStep(3)) return;

    const padded = (n: number) => n.toString().padStart(2, '0');

    const fechaViaje = this.form.fechaSalida
      ? (() => {
          const d = new Date(this.form.fechaSalida + 'T00:00:00');
          return `${padded(d.getDate())} - ${padded(d.getMonth() + 1)} - ${d.getFullYear()}`;
        })()
      : '';

    const reservation: Reservation = {
      id:              Date.now(),
      clienteNombre:   this.form.clienteNombre,
      clienteImagen:   `https://ui-avatars.com/api/?name=${encodeURIComponent(this.form.clienteNombre)}&background=3fa2db&color=fff`,
      clienteEmail:    this.form.clienteEmail,
      clienteTelefono: this.form.clienteTelefono,
      destino:         this.form.destino,
      personas:        Number(this.form.personas) || 1,
      fechaViaje,
      fechaReserva:    new Date().toISOString().split('T')[0],
      estado:          'Pendiente',
      paqueteNombre:   this.form.paqueteNombre,
      total:           Number(this.form.total) || 0,
      notas:           this.form.notas || undefined,
    };

    this.reservationCreated.emit(reservation);
    this.closed.emit();
  }

  cancel(): void {
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.cancel();
    }
  }

  private resetForm(): void {
    this.form = this.emptyForm();
    this.currentStep = 1;
    this.submitted = false;
  }

  private emptyForm(): ReservationForm {
    return {
      clienteNombre:     '',
      tipoDocumento:     '',
      documento:         '',
      clienteEmail:      '',
      clienteTelefono:   '',
      ciudadResidencia:  '',
      personas:          '',
      acompanantes:      [],
      paqueteNombre:     '',
      destino:           '',
      fechaSalida:       '',
      fechaRegreso:      '',
      duracion:          '',
      tipoHabitacion:    '',
      solicitudEspecial: '',
      notas:             '',
      metodoPago:        '',
      estadoPago:        '',
      total:             '',
      comprobante:       '',
      aceptaTerminos:    false,
      aceptaPolitica:    false,
    };
  }

  private emptyAcompanante(): Acompanante {
    return {
      nombre:          '',
      fechaNacimiento: '',
      tipoDocumento:   '',
      documento:       '',
    };
  }
}