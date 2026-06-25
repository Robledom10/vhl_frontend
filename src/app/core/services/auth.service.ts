import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../../features/auth/models/auth.model';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private apiUrl = `${environment.apiUrl}/auth`;

	constructor(
		private http: HttpClient,
		private router: Router,
	) { }

	// =========================
	// LOGIN
	// =========================
	login(request: LoginRequest) {
		return this.http
			.post<LoginResponse>(`${this.apiUrl}/login`, request, {
				withCredentials: true, // 🔴 IMPORTANTE
			})
			.pipe(
				tap((response) => {
					localStorage.setItem('token', response.accessToken);

					if (response.user) {
						localStorage.setItem('user', JSON.stringify(response.user));
					}
				}),
				catchError(this.handleError),
			);
	}

	refreshToken() {
		return this.http.post<{ accessToken: string }>(
			`${this.apiUrl}/tokens/refresh`,
			{},
			{
				withCredentials: true, // 🔴 ENVÍA COOKIE
			},
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
			.post(
				`${this.apiUrl}/tokens/logout`,
				{},
				{
					withCredentials: true,
					responseType: 'text',
					headers: {
						Authorization: `Bearer ${this.getToken()}`,
					},
				},
			)
			.pipe(
				tap(() => {
					this.clearSession();
				}),
				catchError((error) => {
					// aunque falle el backend
					// limpiamos sesión local
					this.clearSession();

					return throwError(() => error);
				}),
			);
	}

	// =========================
	// GET PROFILE
	// =========================
	getProfile() {
		return this.http.get(`${this.apiUrl}/profile`, {
			withCredentials: true,
			headers: {
				Authorization: `Bearer ${this.getToken()}`,
			},
		});
	}

	// =========================
	// UPDATE PROFILE
	// =========================
	updateProfile(data: any) {
		return this.http
			.put(`${this.apiUrl}/profile/update`, data, {
				withCredentials: true,
				headers: {
					Authorization: `Bearer ${this.getToken()}`,
				},
			})
			.pipe(catchError(this.handleError));
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
			headers: {
				Authorization: `Bearer ${this.getToken()}`,
			},
		});
	}

	// =========================
	// LIMPIAR SESIÓN
	// =========================
	clearSession(): void {
		localStorage.clear();
		sessionStorage.clear();

		this.router.navigate(['/']);
	}

	// =========================
	// TOKEN HELPERS
	// =========================
	getToken(): string | null {
		return localStorage.getItem('token');
	}

	isAuthenticated(): boolean {
		const token = this.getToken();
		const user = this.getUser();

		return !!token && !!user;
	}

	// Obtener usuario del localStorage
	getUser() {
		const user = localStorage.getItem('user');

		if (!user || user === 'undefined') {
			return null;
		}

		try {
			return JSON.parse(user);
		} catch (error) {
			console.error('Error parseando usuario:', error);

			localStorage.removeItem('user');

			return null;
		}
	}

	// =========================
	// DESACTIVAR USER
	// =========================

	disableUser(userId: number) {
		return this.http.put(
			`${environment.apiUrl}/admin/users/${userId}/disable`,
			{},
			{
				withCredentials: true,
				headers: {
					Authorization: `Bearer ${this.getToken()}`,
				},
			},
		);
	}

	// =========================
	// ACTIVAR USER
	// =========================

	enableUser(userId: number) {
		return this.http.put(
			`${environment.apiUrl}/admin/users/${userId}/enable`,
			{},
			{
				withCredentials: true,
				headers: {
					Authorization: `Bearer ${this.getToken()}`,
				},
			},
		);
	}

	// =========================
	// Login con Google
	// =========================

	googleLogin(idToken: string) {
		return this.http
			.post<LoginResponse>(
				`${this.apiUrl}/google-login`,
				{
					idToken
				},
				{
					withCredentials: true
				}
			)
			.pipe(
				tap((response) => {
					localStorage.setItem(
						'token',
						response.accessToken
					);

					if (response.user) {
						localStorage.setItem(
							'user',
							JSON.stringify(response.user)
						);
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

		if (error.error?.message) {
			errorMessage = error.error.message;
		} else if (error.error?.error) {
			errorMessage = error.error.error;
		} else if (error.message) {
			errorMessage = error.message;
		}

		return throwError(() => ({
			message: errorMessage,
			status: error.status,
		}));
	}
}
