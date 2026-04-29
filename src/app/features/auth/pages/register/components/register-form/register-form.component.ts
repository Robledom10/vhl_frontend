import { Component } from '@angular/core';
import { AuthService } from '../../../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { RegisterRequest } from '../../../../models/auth.model';
import { passwordMatchValidator, minimumAgeValidator, strongPasswordValidator } from '../../../../../../core/validators/custom.validators';
import { FormBuilder, Validators, AbstractControlOptions } from '@angular/forms';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.css'
})
export class RegisterFormComponent {

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }

  formOptions: AbstractControlOptions = {
    validators: passwordMatchValidator
  };

  registerForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(3)]],
    // middleName: ['', [Validators.minLength(3)]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    // birthdate: ['', [Validators.required, minimumAgeValidator(18)]],
    password: ['', [Validators.required, Validators.minLength(8), strongPasswordValidator]],
    confirmPassword: ['', [Validators.required]],
    documentType: ['', [Validators.required]],
    documentNumber: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(11)]],
    terms: [false, [Validators.requiredTrue]]
  }, this.formOptions);

  submitted = false;

  onSubmit() {

    this.submitted = true;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched()
      return;
    }

    const formValue = this.registerForm.value

    const request: RegisterRequest = {
      firstName: formValue.firstName!,
      // middleName: formValue.middleName!,
      lastName: formValue.lastName!,
      email: formValue.email!,
      // birthdate: formValue.birthdate!,
      password: formValue.password!,
      documentType: formValue.documentType!,
      documentNumber: formValue.documentNumber!
    };

    this.authService.register(request).subscribe({
      next: (res) => {
        console.log('Usuario creado:', res.user);
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('Error en el registro:', err);
      }
    })
  }

  // Funciones para mostrar/ocultar contraseña
  togglePasswordVisibility(inputId: string): void {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password';
    }
  }

  // Función para abrir el selector de fecha en dispositivos móviles
  openDatePicker(event: any) {
    const input = event.target as HTMLInputElement;

    if (input.showPicker) {
      input.showPicker();
    }
  }

  // Getter para acceder fácilmente a los controles del formulario en la plantilla
  get f() {
    return this.registerForm.controls;
  }
}