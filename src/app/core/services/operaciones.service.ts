import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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

  actualizarViaje(id: number, body: object): Observable<Viaje> {
    return this.http.put<Viaje>(`${this.base}/viajes/${id}`, body);
  }

  eliminarViaje(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/viajes/${id}`);
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

  eliminarTransporte(idViaje: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/viajes/${idViaje}/transporte/${id}`);
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

  actualizarAlojamiento(idViaje: number, id: number, body: object): Observable<Alojamiento> {
    return this.http.put<Alojamiento>(`${this.base}/viajes/${idViaje}/alojamientos/${id}`, body);
  }

  eliminarAlojamiento(idViaje: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/viajes/${idViaje}/alojamientos/${id}`);
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

  eliminarInformacionMedica(idViajero: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/viajeros/${idViajero}/informacion-medica/${id}`);
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

  eliminarContacto(idViajero: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/viajeros/${idViajero}/contactos-emergencia/${id}`);
  }

  // --- Incidentes ---
  getIncidentes(idViaje: number): Observable<Incidente[]> {
    return this.http.get<Incidente[]>(`${this.base}/viajes/${idViaje}/incidentes`);
  }

  registrarIncidente(idViaje: number, body: object): Observable<Incidente> {
    return this.http.post<Incidente>(`${this.base}/viajes/${idViaje}/incidentes`, body);
  }

  actualizarIncidente(id: number, body: object): Observable<Incidente> {
    return this.http.put<Incidente>(`${this.base}/incidentes/${id}`, body);
  }

  actualizarEstadoIncidente(id: number, estado: string): Observable<Incidente> {
    return this.http.patch<Incidente>(`${this.base}/incidentes/${id}/estado`, { estado });
  }

  eliminarIncidente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/incidentes/${id}`);
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

  // --- Catálogo de paquetes (tourist-catalog-service vía gateway) ---
  getPaquete(id: number): Observable<{ titulo: string; destino: string; duracionDias: number }> {
    return this.http.get<any>(`${environment.apiUrl}/paquetes/${id}`);
  }

  getAllPaquetes(): Observable<{ id: number; titulo: string; destino: string }[]> {
    return this.http.get<any>(`${environment.apiUrl}/paquetes?tamano=100&activo=true`).pipe(
      map(page => page?.content ?? [])
    );
  }

  getPaqueteTituloMap(viajes: Viaje[]): Observable<Record<number, string>> {
    const uniqueIds = [...new Set(viajes.map(v => v.idPaquete))];
    if (uniqueIds.length === 0) return of({});
    return forkJoin(
      uniqueIds.map(id => this.getPaquete(id).pipe(catchError(() => of({ titulo: `Paquete ${id}` }))))
    ).pipe(
      map(paquetes => Object.fromEntries(uniqueIds.map((id, i) => [id, (paquetes[i] as any).titulo])))
    );
  }
}
