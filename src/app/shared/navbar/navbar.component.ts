import { Component, HostListener } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-navbar',
	templateUrl: './navbar.component.html',
	styleUrl: './navbar.component.css',
})
export class NavbarComponent {
	dropdownOpen = false;
	menuOpen = false;

	constructor(public authService: AuthService, private router: Router) { }

	toggleMobileMenu(event: Event) {
		event.stopPropagation();
		this.menuOpen = !this.menuOpen;
		if (!this.menuOpen) {
			this.dropdownOpen = false;
		}
	}

	closeMobileMenu() {
		this.menuOpen = false;
	}

	toggleDropdown(event: Event) {
		event.stopPropagation();
		this.dropdownOpen = !this.dropdownOpen;
	}

	logout() {
		this.authService.logout().subscribe({
			next: () => {
				this.router.navigate(['/home']);
			},
			error: () => {
				this.router.navigate(['/home']);
			},
		});
	}

	get user() {
		return this.authService.getUser();
	}

	hiddenRoles = ['CLIENT'];

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

	get isAdminOrGuide(): boolean {
		const role = this.user?.role;
		return role === 'ADMIN' || role === 'GUIDE';
	}

	get profileRoute(): string {
		const role = this.user?.role;
		if (role === 'ADMIN' || role === 'GUIDE') {
			return '/panel-admin/control-panel';
		}
		return '/panel-admin/profile';
	}

	@HostListener('document:click')
	closeDropdown() {
		this.dropdownOpen = false;
		this.menuOpen = false;
	}
}