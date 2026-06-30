import { Component, EventEmitter, HostListener, Input, OnChanges, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AuthService } from '../../../../../../core/services/auth.service';
import { UserItem } from '../../models/user.model';

@Component({
	selector: 'app-edit-user-role-modal',
	templateUrl: './edit-user-role-modal.component.html',
	styleUrl: './edit-user-role-modal.component.css',
})
export class EditUserRoleModalComponent implements OnChanges {
	@Input() isOpen = false;
	@Input() user: UserItem | null = null;
	@Output() closed = new EventEmitter<void>();
	@Output() updated = new EventEmitter<UserItem>();
	roleDropdownOpen = false;
	selectedRole = '';
	isLoading = false;

	// =========================
	// MODALS
	// =========================

	showConfirmModal = false;

	showErrorModal = false;

	showToast = false;
	toastTitle = '';
	toastMessage = '';
	toastType: 'success' | 'edit' | 'delete' | 'error' = 'success';

	errorMessage = '';

	roles = ['Cliente', 'Guía Turístico'];

	constructor(
		private fb: FormBuilder,
		private authService: AuthService,
	) { }

	roleForm = this.fb.group({
		role: [''],
	});

	ngOnChanges(): void {
		if (this.user) {
			this.selectedRole = this.user.role;

			this.roleForm.patchValue({
				role: this.user.role,
			});
		}
	}

	// =========================
	// DROPDOWN
	// =========================

	toggleRoleDropdown(event: Event): void {
		event.stopPropagation();

		this.roleDropdownOpen = !this.roleDropdownOpen;
	}

	selectRole(role: string, event: Event): void {
		event.stopPropagation();

		this.selectedRole = role;

		this.roleForm.patchValue({
			role,
		});

		this.roleDropdownOpen = false;
	}

	@HostListener('document:click')
	closeDropdown(): void {
		this.roleDropdownOpen = false;
	}

	// =========================
	// CLOSE
	// =========================

	closeModal(): void {
		this.closed.emit();
	}

	// =========================
	// OPEN CONFIRM
	// =========================

	updateRole(): void {
		if (!this.user) return;

		this.showConfirmModal = true;
	}

	// =========================
	// CONFIRM UPDATE
	// =========================

	confirmUpdateRole(): void {
		if (!this.user) return;

		this.showConfirmModal = false;

		this.isLoading = true;

		const roleMap: any = {
			Admin: 'ADMIN',
			Cliente: 'CLIENT',
			'Guía Turístico': 'GUIDE',
		};

		const request = {
			userId: this.user.id,
			roleName: roleMap[this.selectedRole],
		};

		this.authService.assignRole(request).subscribe({
			next: () => {
				this.isLoading = false;

				const updatedUser: UserItem = {
					...this.user!,
					role: this.selectedRole,
				};

				this.updated.emit(updatedUser);
				this.showFeedbackToast('Rol actualizado', `El rol de ${this.user?.name} fue actualizado correctamente.`, 'edit');

				setTimeout(() => {
					this.closeModal();
				}, 3000);
			},

			error: (err) => {
				console.error(err);

				this.isLoading = false;

				this.errorMessage =
					err?.error?.message || 'No se pudo actualizar el rol';

				this.showErrorModal = true;
			},
		});
	}

	// =========================
	// CLOSE MODALS
	// =========================

	closeConfirmModal(): void {
		this.showConfirmModal = false;
	}

	closeErrorModal(): void {
		this.showErrorModal = false;
	}

	private showFeedbackToast(title: string, message: string, type: 'success' | 'edit' | 'delete' | 'error' = 'success'): void {
		this.toastTitle = title;
		this.toastMessage = message;
		this.toastType = type;
		this.showToast = true;
		setTimeout(() => { this.showToast = false; }, 3000);
	}
}