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
			req.url.includes('/auth/tokens/logout') ||
			req.url.includes('/auth/google-login'); // 👈 Añadido por seguridad para tu flujo de Google

		// 1. Clonamos la petición inicial agregando SIEMPRE la cabecera para ngrok
		let authReq = req.clone({
			headers: req.headers.set('ngrok-skip-browser-warning', 'true')
		});

		const token = this.authService.getToken();

		// 2. NO enviar token en rutas públicas, pero conservamos la cabecera ngrok que añadimos arriba
		if (!isAuthRequest && token) {
			authReq = this.addToken(authReq, token); // 👈 Pasamos 'authReq' (que ya tiene ngrok) en lugar de 'req'
		}

		return next.handle(authReq).pipe(
			catchError((error: HttpErrorResponse) => {
				// SOLO manejar 401 en endpoints protegidos
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

					// Guardar nuevo token
					localStorage.setItem('token', newToken);

					this.refreshTokenSubject.next(newToken);

					// Reintentar request original (addToken ya mantiene la cabecera ngrok existente)
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
			// Esperar mientras otro refresh termina (addToken mantiene la cabecera ngrok existente)
			return this.refreshTokenSubject.pipe(
				filter((token) => token != null),
				take(1),
				switchMap((token) => next.handle(this.addToken(req, token!))),
			);
		}
	}

	private addToken(request: HttpRequest<any>, token: string) {
		// 'setHeaders' conserva las cabeceras existentes (como la de ngrok) y añade/reemplaza el Authorization
		return request.clone({
			setHeaders: {
				Authorization: `Bearer ${token}`,
			},
		});
	}
}