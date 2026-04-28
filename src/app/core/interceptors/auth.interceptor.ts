import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

	intercept(
		req: HttpRequest<any>,
		next: HttpHandler
	): Observable<HttpEvent<any>> {

		// 🔑 Obtener token desde localStorage
		const token = localStorage.getItem('token');

		// ❌ Si no hay token, continúa normal
		if (!token) {
			return next.handle(req);
		}

		// 🔐 Clonar request y agregar Authorization header
		const authReq = req.clone({
			setHeaders: {
				Authorization: `Bearer ${token}`
			}
		});

		return next.handle(authReq);
	}
}