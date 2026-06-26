import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private base = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient) { }

  getUsuarioByDocumento(documento: string): Observable<any> {
    return this.http.get<any>(`${this.base}/documento/${documento}`);
  }
}
