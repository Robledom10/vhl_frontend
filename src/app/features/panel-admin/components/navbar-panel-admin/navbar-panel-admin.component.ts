import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar-panel-admin',
  templateUrl: './navbar-panel-admin.component.html',
  styleUrl: './navbar-panel-admin.component.css'
})
export class NavbarPanelAdminComponent {

  role: string = 'admin';
  // admin | cliente | guia

  adminMenu = [
    { icon: 'dashboard', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: 'people', label: 'Usuarios', route: '/admin/usuarios' },
    { icon: 'map', label: 'Paquetes', route: '/admin/paquetes' },
    { icon: 'payments', label: 'Pagos', route: '/admin/pagos' },
    { icon: 'settings', label: 'Configuración', route: '/admin/configuracion' }
  ];

  clienteMenu = [
    { icon: 'home', label: 'Inicio', route: '/cliente/dashboard' },
    { icon: 'travel_explore', label: 'Explorar', route: '/cliente/explorar' },
    { icon: 'bookmark', label: 'Reservas', route: '/cliente/reservas' },
    { icon: 'favorite', label: 'Favoritos', route: '/cliente/favoritos' },
    { icon: 'person', label: 'Perfil', route: '/cliente/perfil' }
  ];

  guiaMenu = [
    { icon: 'dashboard', label: 'Panel', route: '/guia/dashboard' },
    { icon: 'groups', label: 'Turistas', route: '/guia/turistas' },
    { icon: 'event', label: 'Excursiones', route: '/guia/excursiones' },
    { icon: 'location_on', label: 'Rutas', route: '/guia/rutas' },
    { icon: 'person', label: 'Perfil', route: '/guia/perfil' }
  ];

}
