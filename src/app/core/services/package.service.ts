import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SolicitudPaqueteTuristico, RespuestaPaqueteTuristico, RespuestaImagenPaquete, PageResponse, SolicitudProveedor, RespuestaProveedor, } from '../../features/panel-admin/models/package.model';
import { environment } from '../../../environments/environment';
import { RespuestaComentarioPaquete, SolicitudComentarioPaquete } from '../../shared/package-detail-sheet/models/comments.model';

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
		activo?: boolean;
		pagina?: number;
		tamano?: number;
	}): Observable<PageResponse<RespuestaPaqueteTuristico>> {
		let httpParams = new HttpParams();
		if (params?.destino) httpParams = httpParams.set('destino', params.destino);
		if (params?.busqueda) httpParams = httpParams.set('busqueda', params.busqueda);
		if (params?.duracionDias) httpParams = httpParams.set('duracionDias', params.duracionDias);
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

	// --- Proveedores ---
	private proveedoresUrl = `${environment.apiUrl}/proveedores`;

	getProveedores(): Observable<RespuestaProveedor[]> {
		return this.http.get<RespuestaProveedor[]>(this.proveedoresUrl);
	}

	getProveedoresByTipo(tipo: string): Observable<RespuestaProveedor[]> {
		return this.http.get<RespuestaProveedor[]>(`${this.proveedoresUrl}?tipo=${tipo}`);
	}

	crearProveedor(body: SolicitudProveedor): Observable<RespuestaProveedor> {
		return this.http.post<RespuestaProveedor>(this.proveedoresUrl, body);
	}

	actualizarProveedor(id: number, body: SolicitudProveedor): Observable<RespuestaProveedor> {
		return this.http.put<RespuestaProveedor>(`${this.proveedoresUrl}/${id}`, body);
	}

	eliminarProveedor(id: number): Observable<void> {
		return this.http.delete<void>(`${this.proveedoresUrl}/${id}`);
	}

	// --- Comentarios ---
	getComments(packageId: number) {
		return this.http.get<RespuestaComentarioPaquete[]>(
			`${this.apiUrl}/${packageId}/comentarios`
		);
	}

	createComment(packageId: number, request: SolicitudComentarioPaquete) {
		return this.http.post<RespuestaComentarioPaquete>(
			`${this.apiUrl}/${packageId}/comentarios`,
			request
		);
	}

	updateComment(packageId: number, commentId: number, request: SolicitudComentarioPaquete) {
		return this.http.put<RespuestaComentarioPaquete>(
			`${this.apiUrl}/${packageId}/comentarios/${commentId}`,
			request
		);
	}
}
