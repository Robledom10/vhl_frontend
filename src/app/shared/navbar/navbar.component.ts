import { Component, HostListener } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  dropdownOpen = false;

  constructor(public authService: AuthService) {}

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Sesión cerrada');
      },
      error: (err) => {
        console.error('Error logout', err);
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

  @HostListener('document:click')
  closeDropdown() {
    this.dropdownOpen = false;
  }
}
