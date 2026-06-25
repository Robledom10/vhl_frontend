import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RespuestaProveedor, SolicitudProveedor } from '../../features/panel-admin/pages/packages/pages/proveedor/models/provider.model';

export interface PageResponse<T> {
	content: T[];
	totalElements: number;
	totalPages: number;
	number: number;
}

@Injectable({ providedIn: 'root' })
export class ProviderService {

	private apiUrl = `${environment.apiUrl}/proveedores`;

	constructor(private http: HttpClient) { }

	// Lista completa (para selects y asignaciones)
	getProviders(tipo?: string): Observable<RespuestaProveedor[]> {
		let params = new HttpParams();
		if (tipo) params = params.set('tipo', tipo);
		return this.http.get<RespuestaProveedor[]>(this.apiUrl, { params });
	}

	// Paginado (para la tabla de gestión)
	getProvidersPaginado(params?: {
		tipo?: string;
		busqueda?: string;
		pagina?: number;
		tamano?: number;
	}): Observable<PageResponse<RespuestaProveedor>> {
		let httpParams = new HttpParams();
		if (params?.tipo) httpParams = httpParams.set('tipo', params.tipo);
		if (params?.busqueda) httpParams = httpParams.set('busqueda', params.busqueda);
		if (params?.pagina !== undefined) httpParams = httpParams.set('pagina', params.pagina);
		if (params?.tamano !== undefined) httpParams = httpParams.set('tamano', params.tamano);

		return this.http.get<PageResponse<RespuestaProveedor>>(
			`${this.apiUrl}/paginado`,
			{ params: httpParams }
		);
	}

	createProvider(request: SolicitudProveedor): Observable<RespuestaProveedor> {
		return this.http.post<RespuestaProveedor>(this.apiUrl, request);
	}

	updateProvider(id: number, request: SolicitudProveedor): Observable<RespuestaProveedor> {
		return this.http.put<RespuestaProveedor>(`${this.apiUrl}/${id}`, request);
	}

	deleteProvider(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}
}