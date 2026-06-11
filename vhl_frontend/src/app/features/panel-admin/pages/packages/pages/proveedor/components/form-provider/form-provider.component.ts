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
	errorMsg = '';

	tiposComida = ['Internacional', 'Colombiana', 'Italiana', 'Mariscos', 'Parrilla', 'Vegetariana', 'Rápida', 'Otro'];
	tiposVehiculo = ['Bus', 'Avión', 'Van', 'Minibus', 'Lancha', 'Otro'];

	constructor(
		private fb: FormBuilder,
		private providerService: ProviderService
	) { }

	providerForm = this.fb.group({
		nombre:            ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
		tipoProveedor:     ['', Validators.required],
		correo:            ['', [Validators.required, Validators.email]],
		telefono:          ['', [Validators.required, Validators.pattern(/^[+\d\s\-]{7,20}$/)]],
		// Transporte
		tipoVehiculo:      [''],
		placa:             [''],
		conductor:         [''],
		telefonoConductor: [''],
		capacidad:         [null as number | null],
		// Hotel / Restaurante
		direccion:         [''],
		// Guía
		especialidad:      [''],
		idioma:            [''],
		// Restaurante
		tipoComida:        [''],
		// General
		notas:             [''],
	});

	get tipo(): string {
		return this.providerForm.get('tipoProveedor')?.value || '';
	}

	get esTransporte(): boolean { return this.tipo === 'Transporte'; }
	get esHotel(): boolean { return this.tipo === 'Hotel'; }
	get esGuia(): boolean { return this.tipo === 'Guía'; }
	get esRestaurante(): boolean { return this.tipo === 'Restaurante'; }

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['provider'] && this.provider) {
			this.providerForm.patchValue({
				nombre:            this.provider.nombre,
				tipoProveedor:     this.provider.tipoProveedor,
				correo:            this.provider.correo ?? '',
				telefono:          this.provider.telefono ?? '',
				tipoVehiculo:      this.provider.tipoVehiculo ?? '',
				placa:             this.provider.placa ?? '',
				conductor:         this.provider.conductor ?? '',
				telefonoConductor: this.provider.telefonoConductor ?? '',
				capacidad:         this.provider.capacidad ?? null,
				direccion:         this.provider.direccion ?? '',
				especialidad:      this.provider.especialidad ?? '',
				idioma:            this.provider.idioma ?? '',
				tipoComida:        this.provider.tipoComida ?? '',
				notas:             this.provider.notas ?? '',
			});
		}

		if (changes['mode'] && this.mode === 'create') {
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

		const v = this.providerForm.value;
		const request: SolicitudProveedor = {
			nombre:            v.nombre ?? '',
			tipoProveedor:     v.tipoProveedor ?? '',
			correo:            v.correo ?? '',
			telefono:          v.telefono ?? '',
			tipoVehiculo:      v.tipoVehiculo || undefined,
			placa:             v.placa || undefined,
			conductor:         v.conductor || undefined,
			telefonoConductor: v.telefonoConductor || undefined,
			capacidad:         v.capacidad || undefined,
			direccion:         v.direccion || undefined,
			especialidad:      v.especialidad || undefined,
			idioma:            v.idioma || undefined,
			tipoComida:        v.tipoComida || undefined,
			notas:             v.notas || undefined,
		};

		this.loading = true;
		this.errorMsg = '';

		if (this.mode === 'create') {
			this.providerService.createProvider(request).subscribe({
				next: () => {
					this.loading = false;
					this.saved.emit();
					this.closeModal();
				},
				error: (error) => {
					this.loading = false;
					this.errorMsg = error?.error?.mensaje || error?.error?.message || 'Error al crear el proveedor. Intenta de nuevo.';
				}
			});
			return;
		}

		if (this.mode === 'edit' && this.provider) {
			this.providerService.updateProvider(this.provider.id, request).subscribe({
				next: () => {
					this.loading = false;
					this.saved.emit();
					this.closeModal();
				},
				error: (error) => {
					this.loading = false;
					this.errorMsg = error?.error?.mensaje || error?.error?.message || 'Error al actualizar el proveedor. Intenta de nuevo.';
				}
			});
		}
	}
}
