import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthStatistics, ReservationStatistics, CatalogStatistics, PackageReservations } from '../../features/panel-admin/pages/control-panel/models/analytics.model';
import { environment } from '../../../environments/environment';

@Injectable({
	providedIn: 'root'
})
export class AnalyticsService {

	private api = `${environment.apiUrl}/analytics`;

	constructor(private http: HttpClient) { }

	getAuthStatistics(): Observable<AuthStatistics> {
		return this.http.get<AuthStatistics>(`${this.api}/auth-statistics`);
	}

	getReservationStatistics(): Observable<ReservationStatistics> {
		return this.http.get<ReservationStatistics>(`${this.api}/reservation-statistics`);
	}

	getCatalogStatistics(): Observable<CatalogStatistics> {
		return this.http.get<CatalogStatistics>(`${this.api}/catalog-statistics`);
	}

	getPackageReservations(): Observable<PackageReservations[]> {
		return this.http.get<PackageReservations[]>(`${this.api}/packages-by-year`);
	}
}