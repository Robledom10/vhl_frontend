import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
	providedIn: 'root'
})
export class DocumentManagementService {

	private apiUrl = `${environment.apiUrl}`;

	constructor(private http: HttpClient) { }

	// =========================
	// DOCUMENTOS
	// =========================

	uploadDocument(
		userId: number,
		documentType: string,
		file: File
	): Observable<any> {

		const formData = new FormData();

		formData.append('userId', userId.toString());
		formData.append('documentType', documentType);
		formData.append('file', file);

		return this.http.post(
			`${this.apiUrl}/documents/upload`,
			formData
		);
	}

	getAllDocuments(): Observable<any[]> {
		return this.http.get<any[]>(
			`${this.apiUrl}/documents`
		);
	}

	getUserDocuments(userId: number): Observable<any[]> {
		return this.http.get<any[]>(
			`${this.apiUrl}/documents/user/${userId}`
		);
	}

	getDocument(documentId: number): Observable<any> {
		return this.http.get(
			`${this.apiUrl}/documents/detail/${documentId}`
		);
	}

	deleteDocument(documentId: number): Observable<void> {
		return this.http.delete<void>(
			`${this.apiUrl}/documents/${documentId}`
		);
	}

	// =========================
	// VER / DESCARGAR DOCUMENTO
	// =========================

	downloadDocument(
		documentId: number
	): Observable<HttpResponse<Blob>> {

		return this.http.get(
			`${this.apiUrl}/documents/download/${documentId}`,
			{
				responseType: 'blob',
				observe: 'response'
			}
		);

	}

	// =========================
	// VALIDACIÓN
	// =========================

	validateDocument(documentId: number): Observable<string> {

		return this.http.post(
			`${this.apiUrl}/validation/${documentId}`,
			{},
			{
				responseType: 'text'
			}
		);
	}

	getValidationDetail(
		documentId: number
	): Observable<any> {

		return this.http.get(
			`${this.apiUrl}/validation/detail/${documentId}`
		);
	}

	getValidationHistory(
		documentId: number
	): Observable<any[]> {

		return this.http.get<any[]>(
			`${this.apiUrl}/history/${documentId}`
		);
	}

	// =========================
	// CONTRATO
	// =========================

	getContract(): Observable<string> {

		return this.http.get(
			`${this.apiUrl}/contracts`,
			{
				responseType: 'text'
			}
		);
	}

	acceptContract(payload: {
		reservationId: number;
		userId: number;
		contractVersion: string;
		electronicSignature: string;
	}): Observable<any> {

		return this.http.post(
			`${this.apiUrl}/contracts/accept`,
			payload
		);
	}

	hasAcceptedContract(
		reservationId: number,
		userId: number
	): Observable<boolean> {

		const params = new HttpParams()
			.set('reservationId', reservationId)
			.set('userId', userId);

		return this.http.get<boolean>(
			`${this.apiUrl}/contracts/accepted`,
			{ params }
		);
	}

	// =========================
	// FLUJO RESERVA
	// =========================

	canContinueReservation(
		userId: number,
		reservationId: number
	): Observable<boolean> {

		const params = new HttpParams()
			.set('userId', userId)
			.set('reservationId', reservationId);

		return this.http.get<boolean>(
			`${this.apiUrl}/reservation`,
			{ params }
		);
	}

	// =========================
	// ARCHIVO VIAJERO
	// =========================

	getTravelerFile(
		userId: number
	): Observable<any> {

		return this.http.get(
			`${this.apiUrl}/files/${userId}`
		);
	}

	// =========================
	// ADMIN
	// =========================

	getAdminDocuments(): Observable<any[]> {

		return this.http.get<any[]>(
			`${this.apiUrl}/admin/documents`
		);
	}
}