import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

/**
 * Definición de rutas principales de la aplicación
 *
 * Este archivo actúa como el enrutador global del sistema.
 * Se encarga de:
 * - Definir la ruta inicial de la aplicación
 * - Gestionar la carga de módulos mediante lazy loading
 * - Delegar la navegación a módulos feature (como AuthModule)
 */
const routes: Routes = [

  /**
   * Ruta raíz de la aplicación
   *
   * Cuando el usuario accede a:
   * http://localhost:4200/
   *
   * Se redirige automáticamente a:
   * /home
   */
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  // {
  //   path: 'dashboard',
  //   // component: DashboardComponent,
  //   canActivate: [AuthGuard]
  // },

  /**
   * Ruta para el módulo Home
   *
   * Se carga de forma perezosa (lazy loading), lo que significa:
   * - El módulo no se carga al inicio
   * - Solo se carga cuando el usuario accede a /home
   *
   * Esto mejora el rendimiento de la aplicación
   */
  {
    path: 'home',
    loadChildren: () =>
      import('./features/home/home.module').then(
        (m) => m.HomeModule
      ),
  },

  /**
   * Ruta para el módulo de autenticación
   *
   * Se carga de forma perezosa (lazy loading), lo que significa:
   * - El módulo no se carga al inicio
   * - Solo se carga cuando el usuario accede a /auth
   *
   * Esto mejora el rendimiento de la aplicación
   */
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then(
        (m) => m.AuthModule
      ),
  },

  /**
   * Ruta comodín
   *
   * Si el usuario intenta entrar a una ruta inexistente,
   * será redirigido automáticamente al home.
   */
  {
    path: '**',
    redirectTo: 'home',
  },

];

/**
 * Módulo de enrutamiento principal
 *
 * Responsabilidades:
 * - Inicializar el sistema de rutas con RouterModule.forRoot
 * - Registrar las rutas globales de la aplicación
 * - Permitir la navegación entre módulos
 */
@NgModule({

  /**
   * forRoot se usa SOLO en el módulo principal (AppModule)
   */
  imports: [RouterModule.forRoot(routes)],

  /**
   * Exporta RouterModule para que esté disponible en toda la app
   */
  exports: [RouterModule],
})
export class AppRoutingModule {}