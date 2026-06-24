import { Component } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
	selector: 'app-navbar-panel-admin',
	templateUrl: './navbar-panel-admin.component.html',
	styleUrl: './navbar-panel-admin.component.css',
})
export class NavbarPanelAdminComponent {

	visibleMenu: any[] = [];

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

	canShow(item: any): boolean {
		const role = this.user?.role;
		return !item.roles || item.roles.includes(role);
	}

	ngOnInit() {
		this.visibleMenu = this.adminMenu
			.filter(item => this.canShow(item))
			.map(item => ({
				...item,
				children: item.children
					? item.children.filter((child: any) => this.canShow(child))
					: undefined
			}));
	}

	toggleMenu(item: any) {
		item.open = !item.open;
	}

	adminMenu = [
		{
			icon: 'fa-regular fa-user',
			label: 'Perfil',
			route: '/panel-admin/profile',
			roles: ['ADMIN', 'GUIDE', 'CLIENT']
		},
		{
			icon: 'fa-solid fa-table-columns',
			label: 'Panel de control',
			route: '/panel-admin/control-panel',
			roles: ['ADMIN', 'GUIDE']
		},
		// 🔥 MENU DESPLEGABLE
		{
			icon: 'fa-solid fa-briefcase',
			label: 'Paquetes',
			open: false,
			roles: ['ADMIN', 'GUIDE'],
			children: [
				{
					label: 'Paquetes',
					route: '/panel-admin/packages',
					roles: ['ADMIN', 'GUIDE']
				},
				{
					label: 'Asignar Viaje',
					route: '/panel-admin/packages-viajes',
					roles: ['ADMIN', 'GUIDE']
				},
				{
					icon: 'fa-regular fa-thumbs-up',
					label: 'Comentarios',
					route: '/panel-admin/packages-comments',
					roles: ['ADMIN', 'GUIDE']
				},
				{
					label: 'Proveedores',
					route: '/panel-admin/packages-providers',
					roles: ['ADMIN', 'GUIDE']
				},
			],
		},
		{
			icon: 'fa-solid fa-check',
			label: 'Reservas',
			route: '/panel-admin/reservations',
			roles: ['ADMIN', 'GUIDE']
		},
		{
			icon: 'fa-solid fa-users',
			label: 'Usuario y Roles',
			route: '/panel-admin/users-roles',
			roles: ['ADMIN', 'GUIDE']
		},
		{
			icon: 'fa-regular fa-image',
			label: 'Galería',
			route: '/panel-admin/gallery-admin',
			roles: ['ADMIN', 'GUIDE']
		},
		{
			icon: 'fa-solid fa-route',
			label: 'Operaciones',
			open: false,
			roles: ['ADMIN', 'GUIDE'],
			children: [
				{
					label: 'Asignar transporte',
					route: '/panel-admin/operaciones-transporte',
					roles: ['ADMIN', 'GUIDE']
				},
				{
					label: 'Check-in',
					route: '/panel-admin/operaciones-check-in',
					roles: ['ADMIN', 'GUIDE']
				},
				{
					label: 'Asignar alojamiento',
					route: '/panel-admin/operaciones-alojamiento',
					roles: ['ADMIN', 'GUIDE']
				},
				{
					label: 'Información médica',
					route: '/panel-admin/operaciones-info-medica',
					roles: ['ADMIN', 'GUIDE']
				},
				{
					label: 'Comunicaciones',
					route: '/panel-admin/operaciones-comunicaciones',
					roles: ['ADMIN', 'GUIDE']
				},
			],
		},
	];
}