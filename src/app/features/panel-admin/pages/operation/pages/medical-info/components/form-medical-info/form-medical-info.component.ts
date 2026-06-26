import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { OperacionesService } from '../../../../../../../../core/services/operaciones.service';
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
	gruposSanguineos = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

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

	constructor(private fb: FormBuilder, private svc: OperacionesService) { }

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['isOpen']?.currentValue === true) {
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
			}
		}
	}

	cerrar(): void { this.closed.emit(); }

	// =========================================
	// VALIDAR Y ABRIR CONFIRMACIÓN
	// =========================================

	guardar(): void {
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
		const idViajero = this.editandoMedico ? this.editandoMedico.idViajero : 1;
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