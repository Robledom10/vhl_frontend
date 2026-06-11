import { Component } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
	selector: 'app-navbar-panel-admin',
	templateUrl: './navbar-panel-admin.component.html',
	styleUrl: './navbar-panel-admin.component.css',
})
export class NavbarPanelAdminComponent {
	constructor(public authService: AuthService) { }

	hiddenRoles = ['CLIENT'];

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
			GUIDE: 'Guía Turístico',
		};
		return roleMap[role] || role;
	}

	toggleMenu(item: any) {
		item.open = !item.open;
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
		// 🔥 MENU DESPLEGABLE
		{
			icon: 'fa-solid fa-briefcase',
			label: 'Paquetes',
			open: false,
			children: [
				{
					label: 'Paquetes',
					route: '/panel-admin/packages',
				},
				{
					icon: 'fa-regular fa-thumbs-up',
					label: 'Comentarios',
					route: '/panel-admin/comments',
				},
				{
					label: 'Proveedores',
					route: '/panel-admin/packages-providers',
				},
			],
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
			icon: 'fa-regular fa-image',
			label: 'Galería',
			route: '/panel-admin/gallery-admin',
		},
		{
			icon: 'fa-solid fa-route',
			label: 'Operaciones',
			open: false,
			children: [
				{
					label: 'Dashboard operativo',
					route: '/panel-admin/operaciones-dashboard',
				},
				{
					label: 'Asignar transporte',
					route: '/panel-admin/operaciones-transporte',
				},
				{
					label: 'Check-in por QR',
					route: '/panel-admin/operaciones-check-in',
				},
				{
					label: 'Asignar alojamiento',
					route: '/panel-admin/operaciones-alojamiento',
				},
				{
					label: 'Información médica',
					route: '/panel-admin/operaciones-info-medica',
				},
				{
					label: 'Contactos de emergencia',
					route: '/panel-admin/operaciones-contactos',
				},
				{
					label: 'Incidentes',
					route: '/panel-admin/operaciones-incidentes',
				},
				{
					label: 'Comunicaciones',
					route: '/panel-admin/operaciones-comunicaciones',
				},
			],
		},
	];
}
