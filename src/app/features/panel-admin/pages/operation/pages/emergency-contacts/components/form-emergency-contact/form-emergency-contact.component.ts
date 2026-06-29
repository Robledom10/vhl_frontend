import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { OperacionesService } from '../../../../../../../../core/services/operaciones.service';
import { AuthService } from '../../../../../../../../core/services/auth.service';
import { ContactoEmergencia } from '../../../../../../models/operaciones.models';

@Component({
	selector: 'app-form-emergency-contact',
	templateUrl: './form-emergency-contact.component.html',
	styleUrl: './form-emergency-contact.component.css',
})
export class FormEmergencyContactComponent implements OnChanges {
	@Input() isOpen = false;
	@Input() editando: ContactoEmergencia | null = null;
	@Input() idViajeSeleccionado: number | null = null;

	@Output() closed = new EventEmitter<void>();
	@Output() saved = new EventEmitter<string>();
	@Output() saveFailed = new EventEmitter<string>();

	enviando = false;
	formSubmitted = false;
	cargandoUsuarios = false;
	usuarios: { id: number; nombre: string }[] = [];
	usuarioSeleccionadoId: number | null = null;

	// Dropdown state
	usuarioDropdownOpen = false;
	selectedUsuarioLabel = '';

	// Confirmación de guardado
	showConfirmModal = false;

	contactoForm = this.fb.group({
		nombreViajero: ['', Validators.required],
		nombreContacto: ['', [Validators.required, Validators.minLength(3)]],
		relacion: ['', Validators.required],
		telefono: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-]{7,20}$/)]],
		correo: ['', Validators.email],
	});

	constructor(private fb: FormBuilder, private svc: OperacionesService, private authSvc: AuthService) { }

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['isOpen']?.currentValue === true) {
			this.formSubmitted = false;
			this.usuarioDropdownOpen = false;
			this.selectedUsuarioLabel = '';

			if (this.editando) {
				this.contactoForm.patchValue({
					nombreViajero: this.editando.nombreViajero || '',
					nombreContacto: this.editando.nombre,
					relacion: this.editando.parentesco,
					telefono: this.editando.telefono,
					correo: this.editando.correo,
				});
				// Si el contacto no tiene viajero asignado, cargar selector para que el admin lo asigne
				if (!this.editando.idViajero) {
					this.usuarioSeleccionadoId = null;
					this.cargarUsuarios();
				}
			} else {
				this.contactoForm.reset();
				this.usuarioSeleccionadoId = null;
				this.cargarUsuarios();
			}
		}
	}

	private cargarUsuarios(): void {
		if (this.usuarios.length > 0) return;
		this.cargandoUsuarios = true;
		this.authSvc.getAllUsers(0, 200).subscribe({
			next: (response: any) => {
				const users: any[] = response?.content ?? (Array.isArray(response) ? response : []);
				this.usuarios = users.map(u => ({
					id: u.id,
					nombre: `${u.firstName || ''} ${u.lastName || ''}`.trim()
				}));
				this.cargandoUsuarios = false;
			},
			error: () => { this.cargandoUsuarios = false; }
		});
	}

	// ==============================
	// DROPDOWN
	// ==============================

	toggleUsuarioDropdown(): void {
		this.usuarioDropdownOpen = !this.usuarioDropdownOpen;
	}

	onUsuarioChange(idStr: string): void {
		const id = idStr ? +idStr : null;
		this.usuarioSeleccionadoId = id;
		this.usuarioDropdownOpen = false;

		if (!id) {
			this.selectedUsuarioLabel = '';
			this.contactoForm.patchValue({ nombreViajero: '' });
			return;
		}
		const usuario = this.usuarios.find(u => u.id === id);
		if (usuario) {
			this.selectedUsuarioLabel = usuario.nombre;
			this.contactoForm.patchValue({ nombreViajero: usuario.nombre });
		}
	}

	onModalClick(event: Event): void {
		event.stopPropagation();
		const target = event.target as HTMLElement;
		if (!target.closest('.custom-select')) {
			this.usuarioDropdownOpen = false;
		}
	}

	cerrar(): void { this.closed.emit(); }

	// ==============================
	// GUARDAR
	// ==============================

	guardar(): void {
		this.formSubmitted = true;
		if (this.contactoForm.invalid) {
			this.contactoForm.markAllAsTouched();
			return;
		}
		this.showConfirmModal = true;
	}

	cerrarConfirmModal(): void {
		this.showConfirmModal = false;
	}

	confirmarGuardar(): void {
		this.showConfirmModal = false;
		this.enviarFormulario();
	}

	private enviarFormulario(): void {
		this.enviando = true;

		const v = this.contactoForm.value;
		const idViaje = this.idViajeSeleccionado || 1;
		const idViajero = this.editando
			? (this.editando.idViajero || this.usuarioSeleccionadoId || 0)
			: (this.usuarioSeleccionadoId ?? 1);
		const body = {
			idViaje,
			nombre: v.nombreContacto || '',
			parentesco: v.relacion || '',
			telefono: v.telefono || '',
			correo: v.correo || undefined,
			nombreViajero: v.nombreViajero || '',
		};

		const request$ = this.editando
			? (this.editando.fromReserva
				? this.svc.actualizarContactoDeReserva(this.editando.id, body)
				: this.svc.actualizarContacto(this.editando.idViajero, this.editando.id, body))
			: this.svc.registrarContacto(idViajero, body);

		request$.subscribe({
			next: () => {
				this.enviando = false;
				this.saved.emit(
					this.editando
						? 'Contacto de emergencia actualizado correctamente'
						: 'Contacto de emergencia guardado correctamente'
				);
			},
			error: (err) => {
				this.enviando = false;
				this.saveFailed.emit(err?.error?.mensaje || 'Error al guardar');
			}
		});
	}
}