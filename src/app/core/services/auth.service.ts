import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../../features/auth/models/auth.model';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient, private router: Router) { }

  // =========================
  // LOGIN
  // =========================
  login(request: LoginRequest) {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      request,
      {
        withCredentials: true // 🔴 IMPORTANTE
      }
    ).pipe(
      tap((response) => {
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('user', JSON.stringify(response.user));
      }),
      catchError(this.handleError)
    );
  }

  refreshToken() {
    return this.http.post<{ accessToken: string }>(
      `${this.apiUrl}/refresh`,
      {},
      {
        withCredentials: true // 🔴 ENVÍA COOKIE
      }
    );
  }

  // =========================
  // REGISTER
  // =========================
  register(request: RegisterRequest) {
    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/register`,
      request,
      {
        withCredentials: true
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  // =========================
  // LOGOUT (local only)
  // =========================
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    this.router.navigate(['/auth/login'], {
      queryParams: { sessionExpired: true }
    });
  }

  // =========================
  // TOKEN HELPERS
  // =========================
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Obtener usuario del localStorage
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
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
      status: error.status
    }));
  }
}