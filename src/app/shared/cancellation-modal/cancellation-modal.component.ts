import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'app-cancellation-modal',
	templateUrl: './cancellation-modal.component.html',
	styleUrls: ['./cancellation-modal.component.css'],
})
export class CancellationModalComponent {
	@Input() isOpen = false;
	@Output() closed = new EventEmitter<void>();

	close(): void {
		this.closed.emit();
	}

	onOverlayClick(event: MouseEvent): void {
		if ((event.target as HTMLElement).classList.contains('terms-overlay')) {
			this.close();
		}
	}
}
