import { Component } from '@angular/core';
import { UserItem } from './models/user.model';
import { AuthService } from '../../../../core/services/auth.service';

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

  showEditModal = false;

  selectedUser: UserItem | null = null;

  // =========================
  // USERS
  // =========================

  users: UserItem[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // =========================
  // LOAD USERS
  // =========================

  loadUsers(): void {
    this.authService.getAllUsers().subscribe({
      next: (response: any[]) => {
        this.users = response.map((user) => ({
          id: user.id,
          image:
            user.image || `https://ui-avatars.com/api/?name=${user.firstName}`,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,

          // AQUI EL FIX
          role: this.mapRole(user.role),

          status: user.status ? 'Activo' : 'Inactivo',
        }));
      },

      error: (err) => {
        console.error(err);
      },
    });
  }

  // =========================
  // MAP ROLE
  // =========================

  mapRole(role: string): string {
    const roleMap: any = {
      ROLE_ADMIN: 'Admin',
      ROLE_CLIENT: 'Cliente',
      ROLE_GUIDE: 'Guía Turístico',
    };

    return roleMap[role] || role;
  }

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

  // =========================
  // EDIT MODAL
  // =========================

  openEditModal(user: UserItem): void {
    this.selectedUser = user;

    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  onRoleUpdated(updatedUser: UserItem): void {
    const index = this.users.findIndex((user) => user.id === updatedUser.id);

    if (index !== -1) {
      this.users[index] = updatedUser;
    }

    this.showEditModal = false;
  }
}
