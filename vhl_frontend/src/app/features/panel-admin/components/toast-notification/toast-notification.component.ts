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
}
