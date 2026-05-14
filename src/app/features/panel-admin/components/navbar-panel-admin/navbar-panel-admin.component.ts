import { Component } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-navbar-panel-admin',
  templateUrl: './navbar-panel-admin.component.html',
  styleUrl: './navbar-panel-admin.component.css',
})
export class NavbarPanelAdminComponent {
  constructor(public authService: AuthService) {}

  hiddenRoles = ['ROLE_CLIENT'];

  get user() {
    return this.authService.getUser();
  }

  get displayRole(): string | null {
    const role = this.user?.role;

    if (!role || this.hiddenRoles.includes(role)) {
      return null;
    }

    const roleMap: { [key: string]: string } = {
      ADMIN: 'Administrador',
    };
    return roleMap[role] || role;
  }

  adminMenu = [
    {
      icon: 'fa-regular fa-user',
      label: 'Perfil',
      route: '/panel-admin/profile',
    },
    {
      icon: 'fa-solid fa-table-columns',
      label: 'Panel de control',
      route: '/panel-admin/control-panel',
    },
    {
      icon: 'fa-solid fa-briefcase',
      label: 'Paquetes',
      route: '/panel-admin/packages',
    },
    {
      icon: 'fa-solid fa-check',
      label: 'Reservas',
      route: '/panel-admin/reservations',
    },
    {
      icon: 'fa-solid fa-users',
      label: 'Usuario y Roles',
      route: '/panel-admin/users-roles',
    },
    {
      icon: 'fa-regular fa-thumbs-up',
      label: 'Comentarios',
      route: '/panel-admin/comments',
    },
    {
      icon: 'fa-regular fa-image',
      label: 'Galería',
      route: '/panel-admin/admin-gallery',
    },
    {
      icon: 'fa-regular fa-message',
      label: 'Mensajes',
      route: '/panel-admin/messages',
      badge: 7,
    },
    {
      icon: 'fa-solid fa-tags',
      label: 'Ofertas',
      route: '/panel-admin/offers',
    },
  ];
}
