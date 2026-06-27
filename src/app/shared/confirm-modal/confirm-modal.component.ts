import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'app-confirm-modal',
	templateUrl: './confirm-modal.component.html',
	styleUrl: './confirm-modal.component.css',
})
export class ConfirmModalComponent {
	@Input() isOpen = false;
	@Input() title = 'Confirmar acción';
	@Input() message = '¿Deseas continuar?';
	@Input() confirmText = 'Confirmar';
	@Input() cancelText = 'Cancelar';
	@Input() icon = 'fa-solid fa-circle-question';
	@Input() confirmColor = 'var(--color-primario)';
	@Input() iconBg = 'rgba(63, 162, 219, 0.12)';
	@Input() iconColor = 'var(--color-primario)';
	@Output() confirmed = new EventEmitter<void>();
	@Output() closed = new EventEmitter<void>();

	close(): void {
		this.closed.emit();
	}

	confirm(): void {
		this.confirmed.emit();
	}
}
