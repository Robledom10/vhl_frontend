import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

/**
 * Definición de rutas internas del módulo de autenticación
 *
 * Estas rutas son hijas de la ruta principal definida en el AppRoutingModule:
 * path: 'auth'
 *
 * Por lo tanto, las rutas finales serán:
 * - /auth/login
 * - /auth/register
 * - /auth/forgot-password
 * - /auth/reset-password?token=...
 */
const routes: Routes = [

	{ path: 'register', component: RegisterComponent },

	{ path: 'login', component: LoginComponent },

	{ path: 'forgot-password', component: ForgotPasswordComponent },

	{ path: 'reset-password', component: ResetPasswordComponent }
];

@NgModule({

	imports: [RouterModule.forChild(routes)],

	exports: [RouterModule]
})
export class AuthRoutingModule { }