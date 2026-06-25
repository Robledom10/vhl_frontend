import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) { }

  createPaymentLink(request: any): Observable<string> {
    const headers = new HttpHeaders({
      'indempotency-key': crypto.randomUUID()
    });

    return this.http.post(`${this.apiUrl}/create-link`, request, {
      headers,
      responseType: 'text'
    });
  }
}
