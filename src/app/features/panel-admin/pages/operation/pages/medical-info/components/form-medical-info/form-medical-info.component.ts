import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { OperacionesService } from '../../../../../../../../core/services/operaciones.service';
import { AuthService } from '../../../../../../../../core/services/auth.service';
import { InformacionMedica } from '../../../../../../models/operaciones.models';

@Component({
	selector: 'app-form-medical-info',
	templateUrl: './form-medical-info.component.html',
	styleUrl: './form-medical-info.component.css',
})
export class FormMedicalInfoComponent implements OnChanges {
	@Input() isOpen = false;
	@Input() editandoMedico: InformacionMedica | null = null;
	@Input() idViajeSeleccionado: number | null = null;

	@Output() closed = new EventEmitter<void>();
	@Output() saved = new EventEmitter<string>();
	@Output() saveFailed = new EventEmitter<string>();

	enviando = false;
	formSubmitted = false;
	cargandoUsuarios = false;
	usuarios: { id: number; nombre: string }[] = [];
	usuarioSeleccionadoId: number | null = null;
	gruposSanguineos = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

	// Dropdown state
	usuarioDropdownOpen = false;
	tipoSangreDropdownOpen = false;
	selectedUsuarioLabel = '';

	// Confirmación de guardado
	showConfirmModal = false;

	medForm = this.fb.group({
		nombreViajero: ['', Validators.required],
		tipoSangre: ['', Validators.required],
		alergias: [''],
		medicamentos: [''],
		condiciones: [''],
		telefonoMedico: ['', Validators.pattern(/^\+?[\d\s\-]{7,20}$/)],
	});

	constructor(private fb: FormBuilder, private svc: OperacionesService, private authSvc: AuthService) { }

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['isOpen']?.currentValue === true) {
			this.formSubmitted = false;
			this.usuarioDropdownOpen = false;
			this.tipoSangreDropdownOpen = false;
			this.selectedUsuarioLabel = '';

			if (this.editandoMedico) {
				this.medForm.patchValue({
					nombreViajero: this.editandoMedico.nombreViajero || ('Viajero #' + this.editandoMedico.idViajero),
					tipoSangre: this.editandoMedico.tipoSangre,
					alergias: this.editandoMedico.alergias,
					medicamentos: this.editandoMedico.medicamentos,
					condiciones: this.editandoMedico.condicionesMedicas,
					telefonoMedico: this.editandoMedico.telefonoMedico,
				});
			} else {
				this.medForm.reset();
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
	// DROPDOWNS
	// ==============================

	toggleUsuarioDropdown(): void {
		this.usuarioDropdownOpen = !this.usuarioDropdownOpen;
		this.tipoSangreDropdownOpen = false;
	}

	toggleTipoSangreDropdown(): void {
		this.tipoSangreDropdownOpen = !this.tipoSangreDropdownOpen;
		this.usuarioDropdownOpen = false;
	}

	onUsuarioChange(idStr: string): void {
		const id = idStr ? +idStr : null;
		this.usuarioSeleccionadoId = id;
		this.usuarioDropdownOpen = false;

		if (!id) {
			this.selectedUsuarioLabel = '';
			this.medForm.patchValue({ nombreViajero: '' });
			return;
		}
		const usuario = this.usuarios.find(u => u.id === id);
		if (usuario) {
			this.selectedUsuarioLabel = usuario.nombre;
			this.medForm.patchValue({ nombreViajero: usuario.nombre });
		}
	}

	selectTipoSangre(grupo: string): void {
		this.medForm.patchValue({ tipoSangre: grupo });
		this.medForm.get('tipoSangre')?.markAsTouched();
		this.tipoSangreDropdownOpen = false;
	}

	onModalClick(event: Event): void {
		event.stopPropagation();
		const target = event.target as HTMLElement;
		if (!target.closest('.custom-select')) {
			this.usuarioDropdownOpen = false;
			this.tipoSangreDropdownOpen = false;
		}
	}

	cerrar(): void { this.closed.emit(); }

	// ==============================
	// GUARDAR
	// ==============================

	guardar(): void {
		this.formSubmitted = true;
		if (this.medForm.invalid) {
			this.medForm.markAllAsTouched();
			return;
		}
		if (!this.idViajeSeleccionado) {
			this.saveFailed.emit('Selecciona un viaje');
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
		const v = this.medForm.value;
		const body = {
			idViaje: this.idViajeSeleccionado,
			tipoSangre: v.tipoSangre || '',
			alergias: v.alergias || '',
			medicamentos: v.medicamentos || '',
			condicionesMedicas: v.condiciones || '',
			telefonoMedico: v.telefonoMedico || undefined,
			nombreViajero: v.nombreViajero || '',
		};
		const idViajero = this.editandoMedico ? this.editandoMedico.idViajero : (this.usuarioSeleccionadoId ?? 1);
		const req$ = this.editandoMedico
			? this.svc.actualizarInformacionMedica(this.editandoMedico.idViajero, this.editandoMedico.id, body)
			: this.svc.registrarInformacionMedica(idViajero, body);
		req$.subscribe({
			next: () => {
				this.enviando = false;
				this.saved.emit(
					this.editandoMedico ? 'Registro médico actualizado correctamente' : 'Registro médico guardado correctamente'
				);
			},
			error: (err) => {
				this.enviando = false;
				const campos = err?.error?.campos;
				const det = campos && Object.keys(campos).length ? ': ' + Object.values(campos).join(', ') : '';
				this.saveFailed.emit((err?.error?.mensaje || 'Error al guardar') + det);
			},
		});
	}
}