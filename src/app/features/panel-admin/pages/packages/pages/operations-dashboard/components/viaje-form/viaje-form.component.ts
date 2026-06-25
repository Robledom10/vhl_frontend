import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../../../../../../core/services/auth.service';
import { OperacionesService } from '../../../../../../../../core/services/operaciones.service';

@Component({
	selector: 'app-viaje-form',
	templateUrl: './viaje-form.component.html',
	styleUrl: './viaje-form.component.css'
})
export class ViajeFormComponent implements OnInit, OnChanges {

	@Input() visible = false;

	@Input() paquetes: {
		id: number;
		titulo: string;
		destino: string;
		duracionDias: number;
	}[] = [];

	@Output() cerrar = new EventEmitter<void>();

	/**
	 * Se dispara únicamente cuando el viaje
	 * fue creado correctamente.
	 */
	@Output() crear = new EventEmitter<void>();

	viajeForm!: FormGroup;

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

		this.viajeForm = this.fb.group({
			idPaquete: ['', Validators.required],
			fechaSalida: ['', Validators.required],
			fechaRegreso: ['']
		});

		this.suscribirCambios();
	}

	ngOnChanges(changes: SimpleChanges): void {

		if (
			changes['visible'] &&
			this.visible &&
			this.viajeForm
		) {
			this.resetFormulario();
		}
	}

	private suscribirCambios(): void {

		this.viajeForm
			.get('idPaquete')
			?.valueChanges
			.subscribe(() => {
				this.actualizarFechaRegreso();
			});

		this.viajeForm
			.get('fechaSalida')
			?.valueChanges
			.subscribe(() => {
				this.actualizarFechaRegreso();
			});
	}

	private actualizarFechaRegreso(): void {

		const idPaquete = Number(
			this.viajeForm.value.idPaquete
		);

		const fechaSalida =
			this.viajeForm.value.fechaSalida;

		if (!idPaquete || !fechaSalida) {

			this.viajeForm.patchValue(
				{
					fechaRegreso: ''
				},
				{
					emitEvent: false
				}
			);

			return;
		}

		const paquete =
			this.paquetes.find(
				p => p.id === idPaquete
			);

		if (!paquete) return;

		this.viajeForm.patchValue(
			{
				fechaRegreso:
					this.calcularFechaRegreso(
						fechaSalida,
						paquete.duracionDias
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

		if (this.viajeForm.invalid) {
			this.viajeForm.markAllAsTouched();
			return;
		}

		const usuario = this.authService.getUser();

		if (!usuario?.id) {
			this.errorMsg = 'No se pudo obtener el usuario activo.';
			return;
		}

		const formulario = this.viajeForm.getRawValue();

		const paquete = this.paquetes.find(
			p => p.id === Number(formulario.idPaquete)
		);

		if (!paquete) {
			this.errorMsg = 'Paquete inválido.';
			return;
		}

		// Se vuelve a calcular para asegurar que nunca sea nulo
		const fechaRegreso = this.calcularFechaRegreso(
			formulario.fechaSalida,
			paquete.duracionDias
		);

		// También se actualiza el input por si aún no se había refrescado
		this.viajeForm.patchValue(
			{
				fechaRegreso
			},
			{
				emitEvent: false
			}
		);

		this.enviando = true;
		this.errorMsg = '';

		this.operacionesService.crearViaje({
			idUsuario: usuario.id,
			idPaquete: Number(formulario.idPaquete),
			fechaSalida: formulario.fechaSalida,
			fechaRegreso
		})
			.subscribe({
				next: () => {

					this.enviando = false;

					this.mostrarToast(
						'Viaje creado',
						'El viaje fue creado correctamente.'
					);

					setTimeout(() => {
						this.crear.emit();
						this.resetFormulario();
					}, 900);
				},
				error: (err) => {

					this.enviando = false;

					this.errorMsg =
						err?.error?.mensaje ??
						err?.error?.message ??
						'Error al crear el viaje.';

					this.mostrarToast(
						'Error',
						this.errorMsg
					);
				}
			});
	}

	abrirConfirmacion(): void {

		if (this.viajeForm.invalid) {
			this.viajeForm.markAllAsTouched();
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

	resetFormulario(): void {

		this.errorMsg = '';

		this.viajeForm.reset({
			idPaquete: '',
			fechaSalida: '',
			fechaRegreso: ''
		});
	}

	cerrarModal(): void {

		if (this.enviando) return;

		this.resetFormulario();

		this.cerrar.emit();
	}
}