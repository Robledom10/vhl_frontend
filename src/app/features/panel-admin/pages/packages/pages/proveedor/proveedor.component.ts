import { Component, OnInit } from '@angular/core';
import { ProviderService } from '../../../../../../core/services/provider.service';
import { RespuestaProveedor } from './models/provider.model';

@Component({
	selector: 'app-proveedor',
	templateUrl: './proveedor.component.html',
	styleUrl: './proveedor.component.css'
})
export class ProveedorComponent implements OnInit {

	showModal = false;

	modalMode: 'create' | 'edit' | 'view' = 'create';

	selectedProvider: RespuestaProveedor | null = null;

	providers: RespuestaProveedor[] = [];

	search = '';

	dropdownOpen = false;

	selectedType = 'Todos';

	types = [
		'Todos',
		'Hotel',
		'Transporte',
		'Restaurante',
		'Guía'
	];

	constructor(
		private providerService: ProviderService
	) { }

	ngOnInit(): void {
		this.loadProviders();
	}

	loadProviders(): void {
		this.providerService.getProviders().subscribe({
			next: (response) => {
				this.providers = response;
			},
			error: (error) => {
				console.error(error);
			}
		});
	}

	toggleDropdown(): void {
		this.dropdownOpen = !this.dropdownOpen;
	}

	selectType(type: string): void {
		this.selectedType = type;
		this.dropdownOpen = false;
	}

	get filteredProviders() {

		return this.providers.filter(provider => {

			const matchesSearch =
				provider.nombre
					.toLowerCase()
					.includes(this.search.toLowerCase()) ||

				provider.correo
					?.toLowerCase()
					.includes(this.search.toLowerCase());

			const matchesType = this.selectedType === 'Todos' || provider.tipoProveedor === this.selectedType;

			return matchesSearch && matchesType;
		});
	}

	openCreateModal(): void {
		this.modalMode = 'create';
		this.selectedProvider = null;
		this.showModal = true;
	}

	openEditModal(
		provider: RespuestaProveedor
	): void {
		this.modalMode = 'edit';
		this.selectedProvider = provider;
		this.showModal = true;
	}

	openViewModal(
		provider: RespuestaProveedor
	): void {
		this.modalMode = 'view';
		this.selectedProvider = provider;
		this.showModal = true;
	}

	deleteProvider(
		provider: RespuestaProveedor
	) {

		if (!confirm(
			`¿Eliminar proveedor ${provider.nombre}?`
		)) {
			return;
		}

		this.providerService
			.deleteProvider(provider.id)
			.subscribe({
				next: () => {
					this.loadProviders();
				}
			});
	}
}