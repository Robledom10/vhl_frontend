import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
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

  roles = ['Cliente', 'Guía Turístico'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
  ) {}

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

  closeModal(): void {
    this.closed.emit();
  }

  updateRole(): void {
    if (!this.user) return;

    const roleMap: any = {
      Admin: 'ROLE_ADMIN',
      Cliente: 'ROLE_CLIENT',
      'Guía Turístico': 'ROLE_GUIDE',
    };

    const request = {
      userId: this.user.id,
      roleName: roleMap[this.selectedRole],
    };

    this.authService.assignRole(request).subscribe({
      next: () => {
        const updatedUser: UserItem = {
          ...this.user!,
          role: this.selectedRole,
        };

        this.updated.emit(updatedUser);

        this.closeModal();
      },

      error: (err) => {
        console.error(err);
      },
    });
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.roleDropdownOpen = false;
  }
}
