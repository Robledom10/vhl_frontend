import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { Viaje, InformacionMedica, ContactoEmergencia } from '../../../../models/operaciones.models';

@Component({
	selector: 'app-medical-info',
	templateUrl: './medical-info.component.html',
	styleUrl: './medical-info.component.css',
})
export class InfoMedicaComponent implements OnInit {

	// ── Estado compartido ────────────────────────────────────────────
	viajes: Viaje[] = [];
	idViajeSeleccionado: number | null = null;
	paqueteTituloMap: Record<number, string> = {};
	showToast = false;
	toastMsg = '';
	toastType: 'success' | 'error' = 'success';

	// ── Info Médica ──────────────────────────────────────────────────
	showFormMedico = false;
	enviandoMedico = false;
	editandoMedico: InformacionMedica | null = null;
	registros: InformacionMedica[] = [];
	gruposSanguineos = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

	medForm = this.fb.group({
		nombreViajero: ['', Validators.required],
		tipoSangre: ['', Validators.required],
		alergias: [''],
		medicamentos: [''],
		condiciones: [''],
		telefonoMedico: ['', Validators.pattern(/^\+?[\d\s\-]{7,20}$/)],
	});

	// ── Contactos de Emergencia ───────────────────────────────────────
	contactos: ContactoEmergencia[] = [];

	constructor(
		private fb: FormBuilder,
		private svc: OperacionesService,
	) { }

	ngOnInit(): void {
		this.svc.getViajes().subscribe({
			next: (viajes) => {
				this.viajes = viajes;
				this.svc.getPaqueteTituloMap(viajes).subscribe(m => { this.paqueteTituloMap = m; });
				if (viajes.length > 0) {
					this.idViajeSeleccionado = viajes[0].id;
					this.cargarTodo();
				}
				this.cargarTodosContactos();
			},
			error: () => { },
		});
	}

	onViajeChange(event: Event): void {
		const id = Number((event.target as HTMLSelectElement).value);
		this.idViajeSeleccionado = id || null;
		this.registros = [];
		if (this.idViajeSeleccionado) this.cargarTodo();
	}

	cargarTodosContactos(): void {
		if (this.viajes.length === 0) return;
		forkJoin(
			this.viajes.map(v => this.svc.getContactos(v.id).pipe(catchError(() => of([]))))
		).pipe(
			map(results => (results as ContactoEmergencia[][]).flat())
		).subscribe(contactos => {
			this.contactos = contactos;
		});
	}

	cargarTodo(): void {
		if (!this.idViajeSeleccionado) return;
		this.svc.getInformacionMedica(this.idViajeSeleccionado).pipe(
			catchError(() => of([]))
		).subscribe(medicos => {
			this.registros = medicos as InformacionMedica[];
		});
	}

	// ── Médico ────────────────────────────────────────────────────────
	abrirNuevoMedico(): void { this.editandoMedico = null; this.medForm.reset(); this.showFormMedico = true; }

	abrirMedico(r: InformacionMedica): void {
		this.editandoMedico = r;
		this.medForm.patchValue({
			nombreViajero: r.nombreViajero || ('Viajero #' + r.idViajero),
			tipoSangre: r.tipoSangre,
			alergias: r.alergias,
			medicamentos: r.medicamentos,
			condiciones: r.condicionesMedicas,
			telefonoMedico: r.telefonoMedico,
		});
		this.showFormMedico = true;
	}

	cerrarMedico(): void { this.showFormMedico = false; this.editandoMedico = null; }

	guardarMedico(): void {
		if (this.medForm.invalid) { this.medForm.markAllAsTouched(); return; }
		if (!this.idViajeSeleccionado) { this.mostrarToast('Selecciona un viaje', 'error'); return; }
		this.enviandoMedico = true;
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
				this.enviandoMedico = false; this.showFormMedico = false; this.editandoMedico = null;
				this.mostrarToast('Información médica guardada'); this.cargarTodo();
			},
			error: (err) => {
				this.enviandoMedico = false;
				const campos = err?.error?.campos;
				const det = campos && Object.keys(campos).length ? ': ' + Object.values(campos).join(', ') : '';
				this.mostrarToast((err?.error?.mensaje || 'Error al guardar') + det, 'error');
			},
		});
	}

	eliminarMedico(r: InformacionMedica): void {
		if (!confirm(`¿Eliminar el registro médico de ${r.nombreViajero || 'Viajero #' + r.idViajero}?`)) return;
		this.svc.eliminarInformacionMedica(r.idViajero, r.id).subscribe({
			next: () => { this.mostrarToast('Registro médico eliminado'); this.cargarTodo(); },
			error: () => { this.mostrarToast('Error al eliminar', 'error'); },
		});
	}

	mostrarToast(msg: string, type: 'success' | 'error' = 'success'): void {
		this.toastMsg = msg; this.toastType = type; this.showToast = true;
		setTimeout(() => { this.showToast = false; }, 3500);
	}
}
