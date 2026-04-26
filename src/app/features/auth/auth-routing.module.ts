import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';

/**
 * Definición de rutas internas del módulo de autenticación
 * 
 * Estas rutas son hijas de la ruta principal definida en el AppRoutingModule:
 * path: 'auth'
 * 
 * Por lo tanto, las rutas finales serán:
 * - /auth/login
 * - /auth/register
 */
const routes: Routes = [

  /**
   * Ruta para el registro de usuarios
   * URL final: /auth/register
   */
  { path: 'register', component: RegisterComponent },

  /**
   * Ruta para el inicio de sesión
   * URL final: /auth/login
   */
  { path: 'login', component: LoginComponent }
];

/**
 * Módulo de enrutamiento de autenticación
 * 
 * Responsabilidades:
 * - Definir las rutas internas del módulo Auth
 * - Asociar cada ruta con su componente correspondiente
 * - Integrarse con el sistema de routing principal mediante lazy loading
 */
@NgModule({

  /**
   * Se usa forChild porque este routing pertenece a un módulo hijo (feature)
   * y no al módulo raíz de la aplicación
   */
  imports: [RouterModule.forChild(routes)],

  /**
   * Exporta RouterModule para que las rutas estén disponibles
   * dentro de los componentes del módulo
   */
  exports: [RouterModule]
})
export class AuthRoutingModule { }