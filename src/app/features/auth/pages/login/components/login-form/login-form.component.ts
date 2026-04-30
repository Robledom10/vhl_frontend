import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../../core/services/auth.service';
import { LoginRequest } from '../../../../models/auth.model';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})
export class LoginFormComponent {

  loginError: boolean = false;
  isLoading: boolean = false;
  submitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onSubmit() {
    // Limpiar error previo
    this.loginError = false;

      this.submitted = true;

    // Validar formulario
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // Mostrar estado de carga
    this.isLoading = true;

    const formValue = this.loginForm.value;

    const request: LoginRequest = {
      email: formValue.email!,
      password: formValue.password!
    };

    this.authService.login(request).subscribe({
      next: (res) => {
        console.log('Login exitoso:', res);

        // Guardar token en localStorage
        localStorage.setItem('token', res.accessToken);

        // Opcional: guardar datos del usuario
        localStorage.setItem('user', JSON.stringify(res.user));

        this.isLoading = false;

        // Redirigir al dashboard o home
        // this.router.navigate(['/dashboard']); // Ajusta la ruta según tu aplicación
      },
      error: (err) => {
        console.error('Error en el login:', err);
        this.isLoading = false;

        // Mostrar error
        this.loginError = true;
      }
    });
  }

  // Función para mostrar/ocultar contraseña
  togglePasswordVisibility(inputId: string): void {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password';
    }
  }

  // Getter para acceder fácilmente a los controles del formulario
  get f() {
    return this.loginForm.controls;
  }
}