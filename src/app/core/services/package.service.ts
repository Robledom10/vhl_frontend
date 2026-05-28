import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SolicitudPaqueteTuristico, RespuestaPaqueteTuristico } from '../../features/panel-admin/models/package.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PackageService {
  private apiUrl = `${environment.apiUrl}/paquetes`;

  constructor(private http: HttpClient) {}

  createPackage(
    request: SolicitudPaqueteTuristico,
  ): Observable<RespuestaPaqueteTuristico> {
    return this.http.post<RespuestaPaqueteTuristico>(this.apiUrl, request);
  }

  getPackages() {
    return this.http.get(this.apiUrl);
  }

  getPackageById(id: number) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updatePackage(id: number, request: SolicitudPaqueteTuristico) {
    return this.http.put(`${this.apiUrl}/${id}`, request);
  }

  deletePackage(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
