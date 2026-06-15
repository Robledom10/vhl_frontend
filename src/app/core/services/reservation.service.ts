import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Reservation } from '../../features/panel-admin/pages/reservations/models/reservations.models';

export interface SolicitudReserva {
  clienteNombre: string;
  tipoDocumento: string;
  documento: string;
  clienteEmail: string;
  clienteTelefono: string;
  ciudadResidencia: string;
  personas: number;
  acompanantes: { nombre: string; fechaNacimiento: string; tipoDocumento: string; documento: string }[];
  idViaje?: number;
  paqueteNombre: string;
  destino: string;
  fechaSalida: string;
  fechaRegreso: string;
  tipoHabitacion: string;
  solicitudEspecial?: string;
  notas?: string;
  metodoPago: string;
  estadoPago: string;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private base = `${environment.apiUrl}/v1/reservas`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Reservation[]> {
    return this.http.get<any[]>(this.base).pipe(
      map(dtos => dtos.map(d => this.mapDto(d)))
    );
  }

  crear(solicitud: SolicitudReserva): Observable<Reservation> {
    return this.http.post<any>(this.base, solicitud).pipe(
      map(dto => this.mapDto(dto))
    );
  }

  confirmar(id: number): Observable<Reservation> {
    return this.http.put<any>(`${this.base}/${id}/confirmar`, {}).pipe(
      map(dto => this.mapDto(dto))
    );
  }

  reactivar(id: number): Observable<Reservation> {
    return this.http.put<any>(`${this.base}/${id}/reactivar`, {}).pipe(
      map(dto => this.mapDto(dto))
    );
  }

  cancelar(id: number): Observable<Reservation> {
    return this.http.delete<any>(`${this.base}/${id}`).pipe(
      map(dto => this.mapDto(dto))
    );
  }

  private mapDto(dto: any): Reservation {
    return {
      id:              dto.id,
      clienteNombre:   dto.clienteNombre  ?? '',
      clienteImagen:   dto.clienteImagen  ?? '',
      clienteEmail:    dto.clienteEmail   ?? '',
      clienteTelefono: dto.clienteTelefono ?? '',
      destino:         dto.destino        ?? '',
      personas:        dto.personas       ?? dto.cantidadPasajeros ?? 1,
      fechaViaje:      dto.fechaViaje     ?? '',
      fechaReserva:    dto.fechaReserva   ?? '',
      estado:          (dto.estadoDescripcion ?? 'Pendiente') as Reservation['estado'],
      paqueteNombre:   dto.paqueteNombre  ?? '',
      total:           dto.total          ?? dto.precioTotal ?? 0,
      notas:           dto.notas,
    };
  }
}
