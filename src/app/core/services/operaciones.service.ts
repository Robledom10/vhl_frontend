import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Viaje, Transporte, CheckIn, Alojamiento,
  InformacionMedica, ContactoEmergencia, Incidente,
  Notificacion, Dashboard
} from '../../features/panel-admin/models/operaciones.models';

@Injectable({ providedIn: 'root' })
export class OperacionesService {
  private base = `${environment.operacionesUrl}/api/v1/operaciones`;

  constructor(private http: HttpClient) {}

  // --- Viajes ---
  getViajes(): Observable<Viaje[]> {
    return this.http.get<Viaje[]>(`${this.base}/viajes`);
  }

  crearViaje(body: { idUsuario: number; idPaquete: number; fechaSalida: string; fechaRegreso: string }): Observable<Viaje> {
    return this.http.post<Viaje>(`${this.base}/viajes`, body);
  }

  // --- Transporte ---
  getTransportes(idViaje: number): Observable<Transporte[]> {
    return this.http.get<Transporte[]>(`${this.base}/viajes/${idViaje}/transporte`);
  }

  asignarTransporte(idViaje: number, body: object): Observable<Transporte> {
    return this.http.post<Transporte>(`${this.base}/viajes/${idViaje}/transporte`, body);
  }

  actualizarTransporte(idViaje: number, id: number, body: object): Observable<Transporte> {
    return this.http.put<Transporte>(`${this.base}/viajes/${idViaje}/transporte/${id}`, body);
  }

  // --- Check-in ---
  getCheckIns(idViaje: number): Observable<CheckIn[]> {
    return this.http.get<CheckIn[]>(`${this.base}/viajes/${idViaje}/checkins`);
  }

  registrarCheckIn(idViaje: number, body: { idViajero: number; codigoQr: string; idReserva?: number }): Observable<CheckIn> {
    return this.http.post<CheckIn>(`${this.base}/viajes/${idViaje}/checkins`, body);
  }

  // --- Alojamiento ---
  getAlojamientos(idViaje: number): Observable<Alojamiento[]> {
    return this.http.get<Alojamiento[]>(`${this.base}/viajes/${idViaje}/alojamientos`);
  }

  asignarAlojamiento(idViaje: number, body: object): Observable<Alojamiento> {
    return this.http.post<Alojamiento>(`${this.base}/viajes/${idViaje}/alojamientos`, body);
  }

  // --- Informacion medica ---
  getInformacionMedica(idViaje: number): Observable<InformacionMedica[]> {
    return this.http.get<InformacionMedica[]>(`${this.base}/viajes/${idViaje}/informacion-medica`);
  }

  registrarInformacionMedica(idViajero: number, body: object): Observable<InformacionMedica> {
    return this.http.post<InformacionMedica>(`${this.base}/viajeros/${idViajero}/informacion-medica`, body);
  }

  actualizarInformacionMedica(idViajero: number, id: number, body: object): Observable<InformacionMedica> {
    return this.http.put<InformacionMedica>(`${this.base}/viajeros/${idViajero}/informacion-medica/${id}`, body);
  }

  // --- Contactos de emergencia ---
  getContactos(idViaje: number): Observable<ContactoEmergencia[]> {
    return this.http.get<ContactoEmergencia[]>(`${this.base}/viajes/${idViaje}/contactos-emergencia`);
  }

  registrarContacto(idViajero: number, body: object): Observable<ContactoEmergencia> {
    return this.http.post<ContactoEmergencia>(`${this.base}/viajeros/${idViajero}/contactos-emergencia`, body);
  }

  actualizarContacto(idViajero: number, id: number, body: object): Observable<ContactoEmergencia> {
    return this.http.put<ContactoEmergencia>(`${this.base}/viajeros/${idViajero}/contactos-emergencia/${id}`, body);
  }

  // --- Incidentes ---
  getIncidentes(idViaje: number): Observable<Incidente[]> {
    return this.http.get<Incidente[]>(`${this.base}/viajes/${idViaje}/incidentes`);
  }

  registrarIncidente(idViaje: number, body: object): Observable<Incidente> {
    return this.http.post<Incidente>(`${this.base}/viajes/${idViaje}/incidentes`, body);
  }

  actualizarEstadoIncidente(id: number, estado: string): Observable<Incidente> {
    return this.http.patch<Incidente>(`${this.base}/incidentes/${id}/estado`, { estado });
  }

  // --- Notificaciones ---
  getNotificaciones(idViaje: number): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.base}/viajes/${idViaje}/notificaciones`);
  }

  enviarNotificacion(idViaje: number, body: object): Observable<Notificacion> {
    return this.http.post<Notificacion>(`${this.base}/viajes/${idViaje}/notificaciones`, body);
  }

  // --- Dashboard ---
  getDashboard(idViaje: number): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.base}/viajes/${idViaje}/dashboard`);
  }
}
