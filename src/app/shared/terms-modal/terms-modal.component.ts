import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'app-terms-modal',
	templateUrl: './terms-modal.component.html',
	styleUrls: ['./terms-modal.component.css'],
})
export class TermsModalComponent {
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
