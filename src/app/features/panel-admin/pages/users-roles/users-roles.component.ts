import { Component, ElementRef, HostListener } from '@angular/core';
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

	roles = ['Todos', 'Administrador', 'Cliente', 'Guía Turístico'];

	// =========================
	// MODALS
	// =========================

	showStatusModal = false;

	statusAction = '';

	showToast = false;

	showEditModal = false;

	showViewModal = false;

	showCreateModal = false;

	selectedUser: UserItem | null = null;

	// =========================
	// USERS
	// =========================

	currentUser: any = null;

	users: UserItem[] = [];

	// ─── Paginación ──────────────────────────────────────
	currentPage = 0;
	pageSize = 5;
	totalPages = 0;
	totalElements = 0;

	constructor(private authService: AuthService, private elementRef: ElementRef) { }

	ngOnInit(): void {
		this.currentUser = this.authService.getUser();

		this.loadUsers();
	}

	// =========================
	// VALIDAR SI ES EL MISMO ADMIN PARA IMPEDIR QUE EL MISMO SE DESACTIVE
	// =========================

	isCurrentUser(user: UserItem): boolean {
		return this.currentUser?.id === user.id;
	}

	// =========================
	// LOAD USERS
	// =========================

	loadUsers(): void {
		this.authService.getAllUsers(this.currentPage, this.pageSize).subscribe({
			next: (response) => {
				this.totalPages = response.totalPages;
				this.totalElements = response.totalElements;
				this.users = response.content.map((user) => ({
					id: user.id,
					image: user.image || `https://ui-avatars.com/api/?name=${user.firstName}&background=3fa2db&color=fff&size=120`,
					name: `${user.firstName} ${user.lastName}`,
					email: user.email,
					role: this.mapRole(user.role),
					status: user.active ? 'Activo' : 'Inactivo',
					phone: user.phone,
					documentType: user.documentType,
					documentNumber: user.documentNumber,
				}));
			},
			error: (err) => console.error(err),
		});
	}

	goToPage(page: number): void {
		if (page < 0 || page >= this.totalPages) return;
		this.currentPage = page;
		this.loadUsers();
	}

	get pages(): number[] {
		return Array.from({ length: this.totalPages }, (_, i) => i);
	}

	// =========================
	// MAP ROLE
	// =========================

	mapRole(role: string): string {
		const roleMap: any = {
			ADMIN: 'Administrador',
			CLIENT: 'Cliente',
			GUIDE: 'Guía Turístico',
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
	// STATUS MODAL
	// =========================

	openStatusModal(user: UserItem): void {
		this.selectedUser = user;
		this.statusAction = user.status === 'Activo' ? 'desactivar' : 'activar';
		this.showStatusModal = true;
		document.body.style.overflow = 'hidden';
	}

	closeStatusModal(): void {
		this.showStatusModal = false;
		document.body.style.overflow = 'auto';
	}

	confirmStatusChange(): void {
		if (!this.selectedUser) return;

		const request =
			this.selectedUser.status === 'Activo'
				? this.authService.disableUser(this.selectedUser.id)
				: this.authService.enableUser(this.selectedUser.id);

		request.subscribe({
			next: () => {
				this.selectedUser!.status =
					this.selectedUser!.status === 'Activo' ? 'Inactivo' : 'Activo';

				this.showStatusModal = false;
				this.showToast = true;

				setTimeout(() => {
					this.showToast = false;
				}, 3000);
			},

			error: (err) => {
				console.error(err);
			},
		});
	}

	// =========================
	// EDIT MODAL
	// =========================

	openEditModal(user: UserItem): void {
		this.selectedUser = user;
		document.body.style.overflow = 'hidden';
		this.showEditModal = true;
	}

	closeEditModal(): void {
		this.showEditModal = false;
		document.body.style.overflow = 'auto';
	}

	onRoleUpdated(updatedUser: UserItem): void {
		const index = this.users.findIndex((user) => user.id === updatedUser.id);

		if (index !== -1) {
			this.users[index] = updatedUser;
		}

		this.showEditModal = false;
	}

	// =========================
	// VIEW MODAL
	// =========================

	openViewModal(user: UserItem): void {
		this.selectedUser = user;
		document.body.style.overflow = 'hidden';
		this.showViewModal = true;
	}

	closeViewModal(): void {
		this.showViewModal = false;
		document.body.style.overflow = 'auto';
	}

	// =========================
	// CREATE MODAL
	// =========================

	openCreateModal(): void {
		this.showCreateModal = true;
		document.body.style.overflow = 'hidden';
	}

	closeCreateModal(): void {
		this.showCreateModal = false;
		document.body.style.overflow = 'auto';
	}

	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent): void {

		const target = event.target as HTMLElement;

		// Si el click fue dentro de un dropdown o botón de filtro
		if (target.closest('.filter-wrapper')) {
			return;
		}

		this.dropdownOpen = false;
	}
}