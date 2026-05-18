import { Component } from '@angular/core';
import { UserItem } from './models/user.model';

@Component({
  selector: 'app-users-roles',
  templateUrl: './users-roles.component.html',
  styleUrl: './users-roles.component.css',
})
export class UsersRolesComponent {
  // =========================
  // SEARCH & FILTER
  // =========================

  search = '';

  dropdownOpen = false;

  selectedRole = 'Todos';

  roles = ['Todos', 'Admin', 'Cliente', 'Guía Turístico'];

  // =========================
  // MODALS
  // =========================

  showDeleteModal = false;

  showToast = false;

  selectedUser: UserItem | null = null;

  // =========================
  // USERS
  // =========================

  users: UserItem[] = [
    {
      id: 1,
      image: 'https://i.pravatar.cc/100?img=1',
      name: 'Camila Perez',
      email: 'camilitap@gmail.com',
      role: 'Admin',
      status: 'Activo',
    },

    {
      id: 2,
      image: 'https://i.pravatar.cc/100?img=2',
      name: 'Juan Ceballo',
      email: 'juansito@gmail.com',
      role: 'Admin',
      status: 'Activo',
    },

    {
      id: 3,
      image: 'https://i.pravatar.cc/100?img=3',
      name: 'Laura Gómez',
      email: 'laura@gmail.com',
      role: 'Cliente',
      status: 'Activo',
    },
  ];

  // =========================
  // FILTERED USERS
  // =========================

  get filteredUsers(): UserItem[] {
    return this.users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(this.search.toLowerCase()) ||
        user.email.toLowerCase().includes(this.search.toLowerCase());

      const matchesRole =
        this.selectedRole === 'Todos' ? true : user.role === this.selectedRole;

      return matchesSearch && matchesRole;
    });
  }

  // =========================
  // DROPDOWN
  // =========================

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectRole(role: string): void {
    this.selectedRole = role;
    this.dropdownOpen = false;
  }

  // =========================
  // DELETE MODAL
  // =========================

  openDeleteModal(user: UserItem): void {
    this.selectedUser = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (!this.selectedUser) return;

    this.selectedUser.status = 'Inactivo';

    this.showDeleteModal = false;

    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
