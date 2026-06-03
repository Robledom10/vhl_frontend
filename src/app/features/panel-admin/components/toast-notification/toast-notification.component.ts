import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-toast-notification',
	templateUrl: './toast-notification.component.html',
	styleUrl: './toast-notification.component.css',
})
export class ToastNotificationComponent {
	@Input() show = false;
	@Input() title = '';
	@Input() message = '';
	@Input() type: 'success' | 'edit' | 'delete' = 'success';

	get icon(): string {
		const icons = {
			success: 'fa-solid fa-circle-check',
			edit: 'fa-solid fa-pen-to-square',
			delete: 'fa-solid fa-box-archive',
		};

		return icons[this.type];
	}
}
