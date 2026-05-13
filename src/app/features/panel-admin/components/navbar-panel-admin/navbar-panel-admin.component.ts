import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar-panel-admin',
  templateUrl: './navbar-panel-admin.component.html',
  styleUrl: './navbar-panel-admin.component.css',
})
export class NavbarPanelAdminComponent {
  role: string = 'admin';
  // admin | cliente | guia

  adminMenu = [
    {
      icon: 'fa-solid fa-table-columns',
      label: 'Panel de control',
      route: '/admin/dashboard',
    },
    {
      icon: 'fa-solid fa-briefcase',
      label: 'Paquetes',
      route: '/admin/paquetes',
    },
    {
      icon: 'fa-solid fa-check',
      label: 'Reservas',
      route: '/admin/reservas',
    },
    {
      icon: 'fa-regular fa-user',
      label: 'Usuario y Roles',
      route: '/admin/usuarios',
    },
    {
      icon: 'fa-regular fa-thumbs-up',
      label: 'Comentarios',
      route: '/admin/comentarios',
    },
    {
      icon: 'fa-regular fa-image',
      label: 'Galería',
      route: '/admin/galeria',
    },
    {
      icon: 'fa-regular fa-message',
      label: 'Mensajes',
      route: '/admin/mensajes',
      badge: 7,
    },
    {
      icon: 'fa-solid fa-tags',
      label: 'Ofertas',
      route: '/admin/ofertas',
    },
  ];
}
