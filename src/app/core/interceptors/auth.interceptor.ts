import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()

export class AuthInterceptor implements HttpInterceptor {
	private isRefreshing = false;
	private refreshTokenSubject = new BehaviorSubject<string | null>(null);

	constructor(private authService: AuthService) { }

	intercept(
		req: HttpRequest<any>,
		next: HttpHandler,
	): Observable<HttpEvent<any>> {
		const isAuthRequest =
			req.url.includes('/auth/login') ||
			req.url.includes('/auth/register') ||
			req.url.includes('/auth/tokens/refresh') ||
			req.url.includes('/auth/tokens/logout');

		let authReq = req;

		const token = this.authService.getToken();

		//NO enviar token en rutas públicas
		if (!isAuthRequest && token) {
			authReq = this.addToken(req, token);
		}

		return next.handle(authReq).pipe(
			catchError((error: HttpErrorResponse) => {
				//SOLO manejar 401 en endpoints protegidos
				if (error.status === 401 && !isAuthRequest) {
					return this.handle401Error(authReq, next);
				}

				return throwError(() => error);
			}),
		);
	}

	private handle401Error(req: HttpRequest<any>, next: HttpHandler) {
		if (!this.isRefreshing) {
			this.isRefreshing = true;
			this.refreshTokenSubject.next(null);

			return this.authService.refreshToken().pipe(
				switchMap((response: any) => {
					this.isRefreshing = false;

					const newToken = response.accessToken;

					//Guardar nuevo token
					localStorage.setItem('token', newToken);

					this.refreshTokenSubject.next(newToken);

					//Reintentar request original
					return next.handle(this.addToken(req, newToken));
				}),
				catchError((err) => {
					this.isRefreshing = false;

					// sesión expirada
					this.authService.clearSession();

					return throwError(() => err);
				}),
			);
		} else {
			//Esperar mientras otro refresh termina
			return this.refreshTokenSubject.pipe(
				filter((token) => token != null),
				take(1),
				switchMap((token) => next.handle(this.addToken(req, token!))),
			);
		}
	}

	private addToken(request: HttpRequest<any>, token: string) {
		return request.clone({
			setHeaders: {
				Authorization: `Bearer ${token}`,
			},
		});
	}
}