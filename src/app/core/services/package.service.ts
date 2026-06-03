import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SolicitudPaqueteTuristico, RespuestaPaqueteTuristico, RespuestaImagenPaquete, PageResponse } from '../../features/panel-admin/models/package.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PackageService {
	private apiUrl = `${environment.apiUrl}/paquetes`;

	constructor(private http: HttpClient) { }

	createPackage(request: SolicitudPaqueteTuristico): Observable<RespuestaPaqueteTuristico> {
		return this.http.post<RespuestaPaqueteTuristico>(this.apiUrl, request);
	}

	getPackages(params?: {
		destino?: string;
		busqueda?: string;
		duracionDias?: number;
		fechaInicio?: string;
		activo?: boolean;
		pagina?: number;
		tamano?: number;
	}): Observable<PageResponse<RespuestaPaqueteTuristico>> {
		let httpParams = new HttpParams();
		if (params?.destino) httpParams = httpParams.set('destino', params.destino);
		if (params?.busqueda) httpParams = httpParams.set('busqueda', params.busqueda);
		if (params?.duracionDias) httpParams = httpParams.set('duracionDias', params.duracionDias);
		if (params?.fechaInicio) httpParams = httpParams.set('fechaInicio', params.fechaInicio);
		if (params?.activo !== undefined) httpParams = httpParams.set('activo', params.activo);
		if (params?.pagina !== undefined) httpParams = httpParams.set('pagina', params.pagina);
		if (params?.tamano !== undefined) httpParams = httpParams.set('tamano', params.tamano);
		return this.http.get<PageResponse<RespuestaPaqueteTuristico>>(this.apiUrl, { params: httpParams });
	}

	getPackageById(id: number): Observable<RespuestaPaqueteTuristico> {
		return this.http.get<RespuestaPaqueteTuristico>(`${this.apiUrl}/${id}`);
	}

	updatePackage(id: number, request: SolicitudPaqueteTuristico): Observable<RespuestaPaqueteTuristico> {
		return this.http.put<RespuestaPaqueteTuristico>(`${this.apiUrl}/${id}`, request);
	}

	deletePackage(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}`);
	}

	deletePackagePermanent(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/${id}/permanente`);
	}

	uploadImage(file: File): Observable<RespuestaImagenPaquete> {
		const formData = new FormData();
		formData.append('file', file);
		return this.http.post<RespuestaImagenPaquete>(`${this.apiUrl}/imagenes`, formData);
	}
}