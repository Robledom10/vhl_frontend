import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MediaResponse {
  id: string;
  url: string;
  publicId: string;
  type: 'IMAGE' | 'VIDEO';
  year: number;
  excursion: string;
  location: string;
  folder: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class MediaService {
  private readonly API = `${environment.apiUrl}/media`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<MediaResponse[]> {
    return this.http.get<MediaResponse[]>(this.API);
  }

  getByYear(year: number): Observable<MediaResponse[]> {
    return this.http.get<MediaResponse[]>(`${this.API}/year/${year}`);
  }

  getByType(type: string): Observable<MediaResponse[]> {
    return this.http.get<MediaResponse[]>(`${this.API}/type/${type}`);
  }

  getByExcursion(excursion: string): Observable<MediaResponse[]> {
    return this.http.get<MediaResponse[]>(`${this.API}/excursion/${excursion}`);
  }

  getByLocation(location: string): Observable<MediaResponse[]> {
    return this.http.get<MediaResponse[]>(`${this.API}/location/${location}`);
  }
}
