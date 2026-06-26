import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../../../../../../core/services/auth.service';
import { OperacionesService } from '../../../../../../../../core/services/operaciones.service';

@Component({
	selector: 'app-edit-viaje-form',
	templateUrl: './edit-viaje-form.component.html',
	styleUrl: './edit-viaje-form.component.css'
})
export class EditViajeFormComponent implements OnInit, OnChanges {

	@Input() idViaje!: number;
	@Input() idPaquete!: number;
	@Input() fechaSalida = '';
	@Input() duracionDias = 1;

	@Output() cerrar = new EventEmitter<void>();

	/**
	 * Se dispara únicamente cuando
	 * el viaje fue actualizado correctamente.
	 */
	@Output() guardarCambios = new EventEmitter<void>();

	editForm!: FormGroup;

	enviando = false;
	errorMsg = '';
	showConfirm = false;
	showToast = false;
	toastTitle = '';
	toastMessage = '';

	constructor(
		private fb: FormBuilder,
		private operacionesService: OperacionesService,
		private authService: AuthService
	) { }

	ngOnInit(): void {

		this.editForm = this.fb.group({
			fechaSalida: ['', Validators.required],
			fechaRegreso: ['']
		});

		this.editForm
			.get('fechaSalida')
			?.valueChanges
			.subscribe(valor => {

				this.actualizarFechaRegreso(valor);

			});
	}

	ngOnChanges(changes: SimpleChanges): void {

		if (
			(changes['fechaSalida'] || changes['duracionDias']) &&
			this.editForm
		) {
			this.cargarDatos();
		}
	}

	private cargarDatos(): void {

		const salida =
			this.fechaSalida.substring(0, 16);

		this.editForm.patchValue(
			{
				fechaSalida: salida,
				fechaRegreso: this.calcularFechaRegreso(
					salida,
					this.duracionDias
				)
			},
			{
				emitEvent: false
			}
		);

		this.errorMsg = '';
	}

	private actualizarFechaRegreso(fecha: string): void {

		if (!fecha) return;

		this.editForm.patchValue(
			{
				fechaRegreso: this.calcularFechaRegreso(
					fecha,
					this.duracionDias
				)
			},
			{
				emitEvent: false
			}
		);
	}

	private calcularFechaRegreso(
		fechaSalida: string,
		duracionDias: number
	): string {

		if (!fechaSalida) return '';

		const fecha = new Date(fechaSalida);

		fecha.setDate(
			fecha.getDate() + (duracionDias || 1)
		);

		const yyyy = fecha.getFullYear();
		const mm = String(fecha.getMonth() + 1).padStart(2, '0');
		const dd = String(fecha.getDate()).padStart(2, '0');
		const hh = String(fecha.getHours()).padStart(2, '0');
		const min = String(fecha.getMinutes()).padStart(2, '0');

		return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
	}

	guardar(): void {
		if (this.editForm.invalid) {
			this.editForm.markAllAsTouched();
			return;
		}

		const usuario = this.authService.getUser();

		if (!usuario?.id) {
			this.errorMsg = 'No se pudo obtener el usuario activo.';
			return;
		}

		this.enviando = true;
		this.errorMsg = '';

		const formulario =
			this.editForm.getRawValue();

		this.operacionesService
			.actualizarViaje(
				this.idViaje,
				{
					idUsuario: usuario.id,
					idPaquete: this.idPaquete,
					fechaSalida: formulario.fechaSalida,
					fechaRegreso: formulario.fechaRegreso
				}
			)
			.subscribe({

				next: () => {

					this.enviando = false;

					this.mostrarToast(
						'Viaje actualizado',
						'Los cambios fueron guardados correctamente.'
					);

					setTimeout(() => {

						this.guardarCambios.emit();

					}, 900);
				},
				error: (err) => {

					this.enviando = false;

					this.errorMsg =
						err?.error?.mensaje ??
						err?.error?.message ??
						'Error al actualizar el viaje.';

					this.mostrarToast(
						'Error',
						this.errorMsg
					);

				}
			});
	}

	abrirConfirmacion(): void {

		if (this.editForm.invalid) {
			this.editForm.markAllAsTouched();
			return;
		}

		this.showConfirm = true;
	}

	private mostrarToast(
		title: string,
		message: string
	): void {

		this.toastTitle = title;
		this.toastMessage = message;
		this.showToast = true;

		setTimeout(() => {
			this.showToast = false;
		}, 3000);
	}

	cerrarModal(): void {

		if (this.enviando) return;

		this.errorMsg = '';

		this.cerrar.emit();
	}
}