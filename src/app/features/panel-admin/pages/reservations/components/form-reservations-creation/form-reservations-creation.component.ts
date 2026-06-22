import { Component, Input, Output, EventEmitter, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Reservation } from '../../models/reservations.models';
import { ReservationService } from '../../../../../../core/services/reservation.service';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { UsuarioService } from '../../../../../../core/services/usuario.service'; // Ajusta la ruta de tu servicio

// ─── Modelos de front ────

export interface Acompanante {
    nombre: string;
    fechaNacimiento: string;
    tipoDocumento: string;
    documento: string;
}

export interface ContactoEmergenciaForm {
    nombre: string;
    parentesco: string;
    telefono: string;
    correo: string;
}

export interface ReservationForm {
    idUsuario: number | '';
    personas: number | '';
    acompanantes: Acompanante[];
    contactosEmergencia: ContactoEmergenciaForm[];
    idViaje: number | '';
    paqueteNombre: string;
    destino: string;
    fechaSalida: string;
    fechaRegreso: string;
    duracion: string;
    tipoHabitacion: string;
    solicitudEspecial: string;
    notas: string;
    total: number | '';
    aceptaTerminos: boolean;
    aceptaPolitica: boolean;
}

export interface ViajeOption {
    id: number;
    idPaquete: number;
    paqueteNombre: string;
    destino: string;
    fechaSalida: string;
    fechaRegreso: string;
    precio: number;
}

export interface ReservationCreateRequest {
    idUsuario: number;
    idPaquete: number;
    cantidadPasajeros: number;
    precioTotal: number;
    fechaInicioViaje: string;
    fechaFinViaje: string;
    notas?: string;
}

// ─── Animaciones ─────────────────────────────────────────────

const slideIn = trigger('slideIn', [
    transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.96) translateY(16px)' }),
        animate('320ms cubic-bezier(.4,0,.2,1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
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
export class FormReservationsCreationComponent implements OnChanges, OnInit {

    @Input() isOpen = false;
    @Output() closed = new EventEmitter<void>();
    @Output() reservationCreated = new EventEmitter<Reservation>();

    constructor(
        private reservationService: ReservationService,
        private operacionesService: OperacionesService,
        private usuarioService: UsuarioService // <-- Inyectado
    ) { }

    currentStep = 1;
    steps = ['Datos del cliente', 'Datos del viaje', 'Contactos y confirmación'];
    submitted = false;
    isSaving = false;
    saveError = '';

    viajesDisponibles: ViajeOption[] = [];
    cargandoViajes = false;
    errorViajes = false;

    // -- Variables para autocompletar cliente --
    documentoBusqueda: string = '';
    nombreClienteSeleccionado: string = '';
    buscandoCliente = false;
    errorCliente = false;
    // ------------------------------------------

    form: ReservationForm = this.emptyForm();

    ngOnInit(): void {
        this.cargarViajes();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isOpen']?.currentValue === true) {
            this.resetForm();
        }
    }

    // --- NUEVO MÉTODO PARA BUSCAR CLIENTE ---
    buscarCliente(): void {
        if (!this.documentoBusqueda || this.documentoBusqueda.trim() === '') {
            this.resetDatosCliente();
            return;
        }

        this.buscandoCliente = true;
        this.errorCliente = false;

        this.usuarioService.getUsuarioByDocumento(this.documentoBusqueda).subscribe({
            next: (usuario: any) => {
                this.buscandoCliente = false;
                if (usuario && usuario.id) {
                    this.form.idUsuario = usuario.id;
                    this.nombreClienteSeleccionado = `${usuario.nombre} ${usuario.apellido || ''}`.trim();
                } else {
                    this.errorCliente = true;
                    this.resetDatosCliente();
                }
            },
            error: () => {
                this.buscandoCliente = false;
                this.errorCliente = true;
                this.resetDatosCliente();
            }
        });
    }

    private resetDatosCliente(): void {
        this.form.idUsuario = '';
        this.nombreClienteSeleccionado = '';
    }
    // ----------------------------------------

    cargarViajes(): void {
        this.cargandoViajes = true;
        this.errorViajes = false;

        this.operacionesService.getViajes().pipe(
            map(viajes => viajes.filter(v => {
                const e = (v.estado ?? '').toUpperCase();
                return e !== 'CANCELADO' && e !== 'FINALIZADO';
            })),
            catchError(() => of([]))
        ).subscribe({
            next: (viajes) => {
                if (viajes.length === 0) {
                    this.viajesDisponibles = [];
                    this.cargandoViajes = false;
                    return;
                }
                const uniqueIds = [...new Set(viajes.map(v => v.idPaquete))];
                forkJoin(
                    uniqueIds.map(id =>
                        this.operacionesService.getPaquete(id).pipe(catchError(() => of({ titulo: `Paquete ${id}`, destino: '', precio: 0 })))
                    )
                ).subscribe({
                    next: (paquetes) => {
                        const paqueteMap = new Map(uniqueIds.map((id, i) => [id, paquetes[i] as any]));
                        this.viajesDisponibles = viajes.map(v => {
                            const pkg = paqueteMap.get(v.idPaquete) ?? {};
                            return {
                                id: v.id,
                                idPaquete: v.idPaquete,
                                paqueteNombre: pkg.titulo ?? `Paquete ${v.idPaquete}`,
                                destino: pkg.destino ?? '',
                                fechaSalida: v.fechaSalida,
                                fechaRegreso: v.fechaRegreso,
                                precio: pkg.precio ?? 0,
                            };
                        });
                        this.cargandoViajes = false;
                    },
                    error: () => {
                        this.cargandoViajes = false;
                        this.errorViajes = true;
                    },
                });
            },
            error: () => {
                this.cargandoViajes = false;
                this.errorViajes = true;
            },
        });
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
            if (!this.form.idUsuario || !this.form.personas) return false;
            if (Number(this.form.personas) > 1) {
                return this.form.acompanantes.every(
                    a => !!a.nombre && !!a.fechaNacimiento && !!a.tipoDocumento && !!a.documento
                );
            }
            return true;
        }

        if (step === 2) {
            return (
                this.form.idViaje !== '' &&
                !!this.form.paqueteNombre &&
                !!this.form.fechaSalida &&
                !!this.form.fechaRegreso &&
                !!this.form.tipoHabitacion
            );
        }

        if (step === 3) {
            return (
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

    onViajeChange(idViaje: number | ''): void {
        if (!idViaje) {
            this.form.paqueteNombre = '';
            this.form.destino = '';
            this.form.fechaSalida = '';
            this.form.fechaRegreso = '';
            this.form.duracion = '';
            this.form.total = '';
            return;
        }
        const viaje = this.viajesDisponibles.find(v => v.id === Number(idViaje));
        if (viaje) {
            this.form.paqueteNombre = viaje.paqueteNombre;
            this.form.destino = viaje.destino;
            this.form.fechaSalida = viaje.fechaSalida;
            this.form.fechaRegreso = viaje.fechaRegreso;
            this.form.total = viaje.precio * (Number(this.form.personas) || 1);
            this.calcDuracion();
        }
    }

    calcDuracion(): void {
        if (!this.form.fechaSalida || !this.form.fechaRegreso) {
            this.form.duracion = '';
            return;
        }
        const salida = new Date(this.form.fechaSalida);
        const regreso = new Date(this.form.fechaRegreso);
        const diff = Math.ceil(
            (regreso.getTime() - salida.getTime()) / (1000 * 60 * 60 * 24)
        );
        this.form.duracion = diff > 0 ? `${diff} ${diff === 1 ? 'día' : 'días'}` : '';
    }

    addContactoEmergencia(): void {
        this.form.contactosEmergencia.push(this.emptyContacto());
    }

    removeContactoEmergencia(i: number): void {
        this.form.contactosEmergencia.splice(i, 1);
    }

    confirm(): void {
        this.submitted = true;
        if (!this.validateStep(3)) return;

        const viajeSeleccionado = this.viajesDisponibles.find(v => v.id === Number(this.form.idViaje));

        if (!viajeSeleccionado) {
            this.saveError = 'Selecciona un viaje válido antes de confirmar.';
            return;
        }

        this.isSaving = true;
        this.saveError = '';

        const solicitud: ReservationCreateRequest = {
            idUsuario: Number(this.form.idUsuario),
            idPaquete: viajeSeleccionado.idPaquete,
            cantidadPasajeros: Number(this.form.personas) || 1,
            precioTotal: Number(this.form.total) || 0,
            fechaInicioViaje: this.toLocalDateTime(this.form.fechaSalida),
            fechaFinViaje: this.toLocalDateTime(this.form.fechaRegreso),
            notas: this.form.notas || undefined,
        };

        // this.reservationService.crear(solicitud).subscribe({ ... });
    }

    cancel(): void {
        this.closed.emit();
    }

    onOverlayClick(event: MouseEvent): void {
        if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
            this.cancel();
        }
    }

    private toLocalDateTime(fecha: string): string {
        if (!fecha) return '';
        return fecha.includes('T') ? fecha : `${fecha}T00:00:00`;
    }

    private resetForm(): void {
        this.form = this.emptyForm();
        this.currentStep = 1;
        this.submitted = false;
        this.isSaving = false;
        this.saveError = '';
        this.documentoBusqueda = ''; // Resetea también la búsqueda
        this.nombreClienteSeleccionado = '';
        this.buscandoCliente = false;
        this.errorCliente = false;
    }

    private emptyForm(): ReservationForm {
        return {
            idUsuario: '',
            personas: '',
            acompanantes: [],
            contactosEmergencia: [this.emptyContacto()],
            idViaje: '',
            paqueteNombre: '',
            destino: '',
            fechaSalida: '',
            fechaRegreso: '',
            duracion: '',
            tipoHabitacion: '',
            solicitudEspecial: '',
            notas: '',
            total: '',
            aceptaTerminos: false,
            aceptaPolitica: false,
        };
    }

    private emptyAcompanante(): Acompanante {
        return { nombre: '', fechaNacimiento: '', tipoDocumento: '', documento: '' };
    }

    private emptyContacto(): ContactoEmergenciaForm {
        return { nombre: '', parentesco: '', telefono: '', correo: '' };
    }
}