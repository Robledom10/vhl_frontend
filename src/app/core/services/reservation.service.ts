import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Reservation } from '../../features/panel-admin/pages/reservations/models/reservations.models';

export interface ContactoEmergenciaRequest {
  nombre: string;
  parentesco: string;
  telefono: string;
  correo?: string;
}

export interface SolicitudReserva {
  idUsuario: number;
  personas: number;
  acompanantes: { nombre: string; fechaNacimiento: string; tipoDocumento: string; documento: string }[];
  contactosEmergencia?: ContactoEmergenciaRequest[];
  idViaje?: number;
  paqueteNombre: string;
  destino: string;
  fechaSalida: string;
  fechaRegreso: string;
  tipoHabitacion: string;
  solicitudEspecial?: string;
  notas?: string;
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
      id:          dto.id,
      idUsuario:   dto.idUsuario ?? 0,
      datosUsuario: dto.datosUsuario ? {
        id:       dto.datosUsuario.id,
        nombre:   dto.datosUsuario.nombre   ?? '',
        apellido: dto.datosUsuario.apellido ?? '',
        email:    dto.datosUsuario.email    ?? '',
        telefono: dto.datosUsuario.telefono ?? '',
        rol:      dto.datosUsuario.rol,
        activo:   dto.datosUsuario.activo,
      } : undefined,
      contactosEmergencia: Array.isArray(dto.contactosEmergencia)
        ? dto.contactosEmergencia.map((c: any) => ({
            id:         c.id,
            nombre:     c.nombre     ?? '',
            parentesco: c.parentesco ?? '',
            telefono:   c.telefono   ?? '',
            correo:     c.correo,
          }))
        : [],
      destino:      dto.destino        ?? '',
      personas:     dto.personas       ?? dto.cantidadPasajeros ?? 1,
      fechaViaje:   dto.fechaViaje     ?? '',
      fechaReserva: dto.fechaReserva   ?? '',
      estado:       (dto.estadoDescripcion ?? 'Pendiente') as Reservation['estado'],
      paqueteNombre: dto.paqueteNombre ?? '',
      total:        dto.total          ?? dto.precioTotal ?? 0,
      notas:        dto.notas,
    };
  }
}
