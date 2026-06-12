import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OperacionesService } from '../../../../../../core/services/operaciones.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { Viaje, InformacionMedica, ContactoEmergencia } from '../../../../models/operaciones.models';

interface Usuario { id: number; firstName: string; lastName: string; }

@Component({
	selector: 'app-medical-info',
	templateUrl: './medical-info.component.html',
	styleUrl: './medical-info.component.css',
})
export class InfoMedicaComponent implements OnInit {

	// ── Estado compartido ────────────────────────────────────────────
	viajes: Viaje[] = [];
	idViajeSeleccionado: number | null = null;
	usuarios: Usuario[] = [];
	usuarioMap: Record<number, string> = {};
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
	showFormContacto = false;
	enviandoContacto = false;
	editandoContacto: ContactoEmergencia | null = null;
	contactos: ContactoEmergencia[] = [];

	contactoForm = this.fb.group({
		nombreViajero: ['', Validators.required],
		nombreContacto: ['', [Validators.required, Validators.minLength(3)]],
		relacion: ['', Validators.required],
		telefono: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-]{7,20}$/)]],
		correo: ['', Validators.email],
	});

	constructor(
		private fb: FormBuilder,
		private svc: OperacionesService,
		private authSvc: AuthService,
	) { }

	ngOnInit(): void {
		this.authSvc.getAllUsers().subscribe({
			next: (users: any[]) => {
				this.usuarios = users.map(u => ({ id: u.id, firstName: u.firstName, lastName: u.lastName }));
				this.usuarioMap = Object.fromEntries(this.usuarios.map(u => [u.id, `${u.firstName} ${u.lastName}`]));
			},
			error: () => { },
		});

		this.svc.getViajes().subscribe({
			next: (viajes) => {
				this.viajes = viajes;
				this.svc.getPaqueteTituloMap(viajes).subscribe(m => { this.paqueteTituloMap = m; });
				if (viajes.length > 0) {
					this.idViajeSeleccionado = viajes[0].id;
					this.cargarTodo();
				}
			},
			error: () => { },
		});
	}

	getNombreViajero(id: number): string {
		return this.usuarioMap[id] || `Viajero #${id}`;
	}

	onViajeChange(event: Event): void {
		const id = Number((event.target as HTMLSelectElement).value);
		this.idViajeSeleccionado = id || null;
		this.registros = [];
		this.contactos = [];
		if (this.idViajeSeleccionado) this.cargarTodo();
	}

	cargarTodo(): void {
		if (!this.idViajeSeleccionado) return;
		forkJoin({
			medicos: this.svc.getInformacionMedica(this.idViajeSeleccionado).pipe(catchError(() => of([]))),
			contactos: this.svc.getContactos(this.idViajeSeleccionado).pipe(catchError(() => of([]))),
		}).subscribe(({ medicos, contactos }) => {
			this.registros = medicos as InformacionMedica[];
			this.contactos = contactos as ContactoEmergencia[];
		});
	}

	// ── Médico ────────────────────────────────────────────────────────
	abrirNuevoMedico(): void { this.editandoMedico = null; this.medForm.reset(); this.showFormMedico = true; }

	abrirMedico(r: InformacionMedica): void {
		this.editandoMedico = r;
		this.medForm.patchValue({
			nombreViajero: r.nombreViajero || this.getNombreViajero(r.idViajero),
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
		if (!confirm(`¿Eliminar el registro médico de ${this.getNombreViajero(r.idViajero)}?`)) return;
		this.svc.eliminarInformacionMedica(r.idViajero, r.id).subscribe({
			next: () => { this.mostrarToast('Registro médico eliminado'); this.cargarTodo(); },
			error: () => { this.mostrarToast('Error al eliminar', 'error'); },
		});
	}

	// ── Contacto ──────────────────────────────────────────────────────
	abrirNuevoContacto(): void { this.editandoContacto = null; this.contactoForm.reset(); this.showFormContacto = true; }

	abrirContacto(c: ContactoEmergencia): void {
		this.editandoContacto = c;
		this.contactoForm.patchValue({
			nombreViajero: c.nombreViajero || '',
			nombreContacto: c.nombre,
			relacion: c.parentesco,
			telefono: c.telefono,
			correo: c.correo,
		});
		this.showFormContacto = true;
	}

	cerrarContacto(): void { this.showFormContacto = false; this.editandoContacto = null; }

	guardarContacto(): void {
		if (this.contactoForm.invalid) { this.contactoForm.markAllAsTouched(); return; }
		if (!this.idViajeSeleccionado) { this.mostrarToast('Selecciona un viaje', 'error'); return; }
		this.enviandoContacto = true;
		const v = this.contactoForm.value;
		const idViajero = this.editandoContacto ? this.editandoContacto.idViajero : 1;
		const body = {
			idViaje: this.idViajeSeleccionado,
			nombre: v.nombreContacto || '',
			parentesco: v.relacion || '',
			telefono: v.telefono || '',
			correo: v.correo || undefined,
			nombreViajero: v.nombreViajero || '',
		};
		const req$ = this.editandoContacto
			? this.svc.actualizarContacto(this.editandoContacto.idViajero, this.editandoContacto.id, body)
			: this.svc.registrarContacto(idViajero, body);
		req$.subscribe({
			next: () => {
				this.enviandoContacto = false; this.showFormContacto = false; this.editandoContacto = null;
				this.mostrarToast('Contacto de emergencia guardado'); this.cargarTodo();
			},
			error: (err) => {
				this.enviandoContacto = false;
				this.mostrarToast(err?.error?.mensaje || 'Error al guardar', 'error');
			},
		});
	}

	eliminarContacto(c: ContactoEmergencia): void {
		if (!confirm(`¿Eliminar el contacto "${c.nombre}"?`)) return;
		this.svc.eliminarContacto(c.idViajero, c.id).subscribe({
			next: () => { this.contactos = this.contactos.filter(x => x.id !== c.id); this.mostrarToast('Contacto eliminado'); },
			error: () => { this.mostrarToast('Error al eliminar el contacto', 'error'); },
		});
	}

	mostrarToast(msg: string, type: 'success' | 'error' = 'success'): void {
		this.toastMsg = msg; this.toastType = type; this.showToast = true;
		setTimeout(() => { this.showToast = false; }, 3500);
	}
}
