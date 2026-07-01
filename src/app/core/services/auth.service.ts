import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { ForgotPasswordRequest, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, ResetPasswordRequest } from '../../features/auth/models/auth.model';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
	providedIn: 'root',
})
export class AuthService {

	// 🔄 1. Creamos el Subject reactivo con el valor inicial del localStorage
	private currentUserSubject = new BehaviorSubject<any>(this.getInitialUser());

	// 📡 2. Exponemos el observable para que los componentes se suscriban
	public currentUser$ = this.currentUserSubject.asObservable();
	private apiUrl = `${environment.apiUrl}/auth`;

	constructor(
		private http: HttpClient,
		private router: Router,
	) { }

	private getInitialUser(): any {
		const user = localStorage.getItem('user');
		if (!user || user === 'undefined') return null;
		try {
			return JSON.parse(user);
		} catch {
			return null;
		}
	}

	// =========================
	// LOGIN
	// =========================
	login(request: LoginRequest) {
		return this.http
			.post<LoginResponse>(`${this.apiUrl}/login`, request, {
				withCredentials: true,
			})
			.pipe(
				tap((response) => {
					localStorage.setItem('token', response.accessToken);
					if (response.user) {
						localStorage.setItem('user', JSON.stringify(response.user));
						// 🔔 Notificar el cambio a toda la app
						this.currentUserSubject.next(response.user);
					}
				}),
				catchError(this.handleError),
			);
	}

	refreshToken() {
		return this.http.post<{ accessToken: string }>(
			`${this.apiUrl}/tokens/refresh`,
			{},
			{ withCredentials: true },
		);
	}

	// =========================
	// REGISTER
	// =========================
	register(request: RegisterRequest) {
		return this.http
			.post<RegisterResponse>(`${this.apiUrl}/register`, request, {
				withCredentials: true,
			})
			.pipe(catchError(this.handleError));
	}

	// =========================
	// LOGOUT
	// =========================
	logout() {
		return this.http
			.post(`${this.apiUrl}/tokens/logout`, {}, {
				withCredentials: true,
				responseType: 'text',
				headers: { Authorization: `Bearer ${this.getToken()}` },
			})
			.pipe(
				tap(() => this.clearSession()),
				catchError((error) => {
					this.clearSession();
					return throwError(() => error);
				}),
			);
	}

	// =========================
	// GET PROFILE
	// =========================
	getProfile() {
		return this.http.get<any>(`${this.apiUrl}/profile`, {
			withCredentials: true,
			headers: { Authorization: `Bearer ${this.getToken()}` },
		}).pipe(
			tap(user => {
				// 🔔 Si consultas el perfil actualizado, refresca el estado
				localStorage.setItem('user', JSON.stringify(user));
				this.currentUserSubject.next(user);
			}),
			catchError(this.handleError)
		);
	}

	// =========================
	// UPDATE PROFILE
	// =========================
	updateProfile(data: any) {
		return this.http
			.put<any>(`${this.apiUrl}/profile/update`, data, {
				withCredentials: true,
				headers: { Authorization: `Bearer ${this.getToken()}` },
			})
			.pipe(
				tap(updatedUser => {
					// 🔔 Cuando el perfil se actualice con éxito, emite el nuevo usuario
					localStorage.setItem('user', JSON.stringify(updatedUser));
					this.currentUserSubject.next(updatedUser);
				}),
				catchError(this.handleError)
			);
	}

	// =========================
	// USERS
	// =========================

	getAllUsers(page: number = 0, size: number = 10) {
		return this.http.get<{ content: any[]; totalElements: number; totalPages: number; number: number }>(
			`${environment.apiUrl}/admin/users`,
			{
				params: { page: page.toString(), size: size.toString() },
				withCredentials: true,
				headers: { Authorization: `Bearer ${this.getToken()}` },
			}
		);
	}

	// =========================
	// ASSIGN ROLE
	// =========================

	assignRole(data: any) {
		return this.http.post(`${environment.apiUrl}/admin/roles/assign`, data, {
			withCredentials: true,
			headers: { Authorization: `Bearer ${this.getToken()}` },
		});
	}

	// =========================
	// LIMPIAR SESIÓN
	// =========================
	clearSession(): void {
		localStorage.clear();
		sessionStorage.clear();
		// 🔔 Limpiar el flujo reactivo poniendo al usuario en null
		this.currentUserSubject.next(null);
		this.router.navigate(['/']);
	}

	// =========================
	// TOKEN HELPERS
	// =========================
	getToken(): string | null {
		return localStorage.getItem('token');
	}

	isAuthenticated(): boolean {
		return !!this.getToken() && !!this.getUser();
	}

	// Retorna el valor síncrono actual por si se necesita puntualmente
	getUser() {
		return this.currentUserSubject.value;
	}

	// =========================
	// BUSCAR USUARIO POR DOCUMENTO
	// =========================

	getUserByDocumento(documentNumber: string) {
		return this.http.get<any>(
			`${environment.apiUrl}/admin/users/documento/${documentNumber}`,
			{
				withCredentials: true,
				headers: { Authorization: `Bearer ${this.getToken()}` },
			}
		);
	}

	// =========================
	// DESACTIVAR USER
	// =========================

	disableUser(userId: number) {
		return this.http.put(`${environment.apiUrl}/admin/users/${userId}/disable`, {}, {
			withCredentials: true,
			headers: { Authorization: `Bearer ${this.getToken()}` },
		});
	}

	// =========================
	// ACTIVAR USER
	// =========================

	enableUser(userId: number) {
		return this.http.put(`${environment.apiUrl}/admin/users/${userId}/enable`, {}, {
			withCredentials: true,
			headers: { Authorization: `Bearer ${this.getToken()}` },
		});
	}

	// =========================
	// FORGOT PASSWORD
	// =========================
	forgotPassword(request: ForgotPasswordRequest) {
		return this.http
			.post<{ message: string; status: number }>(`${this.apiUrl}/forgot-password`, request, {
				withCredentials: true,
			})
			.pipe(catchError(this.handleError));
	}

	// =========================
	// RESET PASSWORD
	// =========================
	resetPassword(request: ResetPasswordRequest) {
		return this.http
			.post<{ message: string; status: number }>(`${this.apiUrl}/reset-password`, request, {
				withCredentials: true,
			})
			.pipe(catchError(this.handleError));
	}

	// =========================
	// Login con Google
	// =========================

	googleLogin(idToken: string) {
		return this.http
			.post<LoginResponse>(`${this.apiUrl}/google-login`, { idToken }, {
				withCredentials: true
			})
			.pipe(
				tap((response) => {
					localStorage.setItem('token', response.accessToken);
					if (response.user) {
						localStorage.setItem('user', JSON.stringify(response.user));
						this.currentUserSubject.next(response.user);
					}
				}),
				catchError(this.handleError)
			);
	}

	// =========================
	// ERROR HANDLER CENTRALIZADO
	// =========================
	private handleError(error: any) {
		console.error('AuthService Error:', error);
		let errorMessage = 'Error desconocido';
		if (error.error?.message) errorMessage = error.error.message;
		else if (error.error?.error) errorMessage = error.error.error;
		else if (error.message) errorMessage = error.message;

		return throwError(() => ({
			message: errorMessage,
			status: error.status,
		}));
	}
}