import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ProviderService } from '../../../../../../../../core/services/provider.service';
import { RespuestaProveedor, SolicitudProveedor } from '../../models/provider.model';

@Component({
	selector: 'app-form-provider',
	templateUrl: './form-provider.component.html',
	styleUrls: ['./form-provider.component.css']
})
export class FormProviderComponent implements OnChanges {

	@Input() isOpen = false;
	@Input() mode: 'create' | 'edit' | 'view' = 'create';
	@Input() provider: RespuestaProveedor | null = null;
	@Output() closed = new EventEmitter<void>();
	@Output() saved = new EventEmitter<void>();
	loading = false;

	constructor(
		private fb: FormBuilder,
		private providerService: ProviderService
	) { }

	providerForm = this.fb.group({
		nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
		tipoProveedor: ['', Validators.required],
		correo: ['', [Validators.required, Validators.email]],
		telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]]
	});

	ngOnChanges(
		changes: SimpleChanges
	): void {

		if (
			changes['provider'] &&
			this.provider
		) {

			this.providerForm.patchValue({
				nombre: this.provider.nombre,
				tipoProveedor: this.provider.tipoProveedor,
				correo: this.provider.correo ?? '',
				telefono: this.provider.telefono ?? ''
			});
		}

		if (
			changes['mode'] &&
			this.mode === 'create'
		) {
			this.providerForm.reset();
		}

		if (this.mode === 'view') {
			this.providerForm.disable();
		} else {
			this.providerForm.enable();
		}
	}

	closeModal(): void {
		this.closed.emit();
	}

	submitForm(): void {
		if (this.providerForm.invalid) {
			this.providerForm.markAllAsTouched();
			return;
		}

		const request: SolicitudProveedor = {
			nombre: this.providerForm.value.nombre ?? '',
			tipoProveedor: this.providerForm.value.tipoProveedor ?? '',
			correo: this.providerForm.value.correo ?? '',
			telefono: this.providerForm.value.telefono ?? ''
		};

		this.loading = true;

		if (this.mode === 'create') {

			this.providerService
				.createProvider(request)
				.subscribe({
					next: () => {
						this.loading = false;
						this.saved.emit();
						this.closeModal();
					},

					error: (error) => {
						this.loading = false;
						console.error(error);
					}
				});

			return;
		}

		if (this.mode === 'edit' && this.provider) {
			this.providerService
				.updateProvider(
					this.provider.id,
					request
				)
				.subscribe({
					next: () => {
						this.loading = false;
						this.saved.emit();
						this.closeModal();
					},

					error: (error) => {
						this.loading = false;
						console.error(error);
					}
				});
		}
	}
}