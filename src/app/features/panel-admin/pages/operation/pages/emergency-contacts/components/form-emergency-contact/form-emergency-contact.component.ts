import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { OperacionesService } from '../../../../../../../../core/services/operaciones.service';
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

	contactoForm = this.fb.group({
		nombreViajero: ['', Validators.required],
		nombreContacto: ['', [Validators.required, Validators.minLength(3)]],
		relacion: ['', Validators.required],
		telefono: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-]{7,20}$/)]],
		correo: ['', Validators.email],
	});

	constructor(private fb: FormBuilder, private svc: OperacionesService) { }

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['isOpen']?.currentValue === true) {
			if (this.editando) {
				this.contactoForm.patchValue({
					nombreViajero: this.editando.nombreViajero || '',
					nombreContacto: this.editando.nombre,
					relacion: this.editando.parentesco,
					telefono: this.editando.telefono,
					correo: this.editando.correo,
				});
			} else {
				this.contactoForm.reset();
			}
		}
	}

	cerrar(): void { this.closed.emit(); }

	guardar(): void {
		if (this.contactoForm.invalid) { this.contactoForm.markAllAsTouched(); return; }
		this.enviando = true;

		const v = this.contactoForm.value;
		const idViaje = this.idViajeSeleccionado || 1;
		const idViajero = this.editando ? this.editando.idViajero : 1;
		const body = {
			idViaje,
			nombre: v.nombreContacto || '',
			parentesco: v.relacion || '',
			telefono: v.telefono || '',
			correo: v.correo || undefined,
			nombreViajero: v.nombreViajero || '',
		};

		const request$ = this.editando
			? this.svc.actualizarContacto(this.editando.idViajero, this.editando.id, body)
			: this.svc.registrarContacto(idViajero, body);

		request$.subscribe({
			next: () => {
				this.enviando = false;
				this.saved.emit('Contacto de emergencia guardado correctamente');
			},
			error: (err) => {
				this.enviando = false;
				this.saveFailed.emit(err?.error?.mensaje || 'Error al guardar');
			}
		});
	}
}
