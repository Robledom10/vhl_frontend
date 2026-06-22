import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  // Ajusta el puerto y la ruta según tu backend en Spring Boot
  private apiUrl = 'http://localhost:8080/api/usuarios'; 

  constructor(private http: HttpClient) { }

  // Este es el método que conecta con el componente de reservas
  getUsuarioByDocumento(documento: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/documento/${documento}`);
  }
}