import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AuthBannerComponent } from './components/auth-banner/auth-banner.component';
import { LoginFormComponent } from './pages/login/components/login-form/login-form.component';
import { RegisterFormComponent } from './pages/register/components/register-form/register-form.component';
import { LoginTypesComponent } from './components/login-types/login-types.component';
import { ReactiveFormsModule } from '@angular/forms';

/**
 * Módulo de Autenticación (AuthModule)
 * 
 * Este módulo encapsula toda la funcionalidad relacionada con la autenticación
 * de usuarios dentro de la aplicación desarrollada en Angular.
 * 
 * Responsabilidades:
 * - Gestionar las vistas de inicio de sesión (login)
 * - Gestionar el registro de usuarios (register)
 * - Contener componentes reutilizables propios del flujo de autenticación
 * - Definir rutas internas mediante AuthRoutingModule
 * 
 * Características:
 * - Es un módulo de tipo feature (módulo funcional)
 * - Se carga mediante lazy loading desde el AppRoutingModule
 * - Utiliza CommonModule en lugar de BrowserModule (regla de Angular)
 */
@NgModule({

  /**
   * Declaraciones:
   * Componentes que pertenecen exclusivamente a este módulo.
   */
  declarations: [

    /**
     * Componente principal de la vista de login
     */
    LoginComponent,

    /**
     * Componente principal de la vista de registro
     */
    RegisterComponent,

    /**
     * Componente reutilizable que contiene el formulario de login
     */
    LoginFormComponent,

    /**
     * Componente reutilizable que contiene el formulario de registro
     */
    RegisterFormComponent,

    /**
     * Componente visual (banner) usado en las vistas de autenticación
     */
    AuthBannerComponent,
    LoginTypesComponent
  ],

  /**
   * Importaciones:
   * Módulos necesarios para el funcionamiento interno del módulo
   */
  imports: [

    /**
     * Proporciona directivas básicas de Angular como:
     * - ngIf
     * - ngFor
     * - ngClass
     */
    CommonModule,

    /**
     * Módulo de enrutamiento específico de autenticación
     * Define rutas como:
     * - /auth/login
     * - /auth/register
     */
    AuthRoutingModule,
    ReactiveFormsModule
  ]
})
export class AuthModule { }