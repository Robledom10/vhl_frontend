import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RespuestaProveedor, SolicitudProveedor } from '../../features/panel-admin/pages/packages/pages/proveedor/models/provider.model';

@Injectable({
	providedIn: 'root'
})
export class ProviderService {

	private apiUrl = `${environment.apiUrl}/proveedores`;

	constructor(
		private http: HttpClient
	) { }

	getProviders(): Observable<RespuestaProveedor[]> {
		return this.http.get<RespuestaProveedor[]>(this.apiUrl);
	}

	createProvider(
		request: SolicitudProveedor
	): Observable<RespuestaProveedor> {
		return this.http.post<RespuestaProveedor>(
			this.apiUrl,
			request
		);
	}

	updateProvider(
		id: number,
		request: SolicitudProveedor
	): Observable<RespuestaProveedor> {
		return this.http.put<RespuestaProveedor>(
			`${this.apiUrl}/${id}`,
			request
		);
	}

	deleteProvider(id: number): Observable<void> {
		return this.http.delete<void>(
			`${this.apiUrl}/${id}`
		);
	}
}