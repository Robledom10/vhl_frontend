import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserItem } from '../../models/user.model';

@Component({
	selector: 'app-view-user-modal',
	templateUrl: './view-user-modal.component.html',
	styleUrl: './view-user-modal.component.css',
})
export class ViewUserModalComponent {
	@Input() isOpen = false;

	@Input() user: UserItem | null = null;

	@Output() closed = new EventEmitter<void>();

	closeModal(): void {
		this.closed.emit();
	}
}
