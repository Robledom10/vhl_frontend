import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

interface InfoMedica {
  id: number; viajero: string; alergias: string; medicamentos: string;
  condiciones: string; grupoSanguineo: string; tieneCondicion: boolean;
}

@Component({
  selector: 'app-info-medica',
  templateUrl: './info-medica.component.html',
  styleUrl: './info-medica.component.css',
})
export class InfoMedicaComponent {
  showForm = false;
  enviando = false;
  showToast = false;
  toastMsg = '';
  editando: InfoMedica | null = null;

  registros: InfoMedica[] = [
    { id: 1, viajero: 'Carlos Martínez', alergias: 'Polen, mariscos', medicamentos: 'Loratadina', condiciones: 'Ninguna', grupoSanguineo: 'O+', tieneCondicion: true },
    { id: 2, viajero: 'Ana García', alergias: 'Ninguna', medicamentos: 'Ninguno', condiciones: 'Ninguna', grupoSanguineo: 'A+', tieneCondicion: false },
    { id: 3, viajero: 'Pedro López', alergias: 'Penicilina', medicamentos: 'Metformina', condiciones: 'Diabetes tipo 2', grupoSanguineo: 'B+', tieneCondicion: true },
  ];

  gruposSanguineos = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];

  medForm = this.fb.group({
    alergias: ['', Validators.required],
    medicamentos: ['', Validators.required],
    condiciones: ['', Validators.required],
    grupoSanguineo: ['', Validators.required],
  });

  constructor(private fb: FormBuilder) {}

  abrir(registro: InfoMedica): void {
    this.editando = registro;
    this.medForm.patchValue({
      alergias: registro.alergias, medicamentos: registro.medicamentos,
      condiciones: registro.condiciones, grupoSanguineo: registro.grupoSanguineo,
    });
    this.showForm = true;
  }

  cerrar(): void { this.showForm = false; this.editando = null; }

  guardar(): void {
    if (this.medForm.invalid) { this.medForm.markAllAsTouched(); return; }
    this.enviando = true;
    setTimeout(() => {
      if (this.editando) {
        const idx = this.registros.findIndex(r => r.id === this.editando!.id);
        if (idx !== -1) {
          const v = this.medForm.value;
          this.registros[idx] = { ...this.registros[idx], alergias: v.alergias!, medicamentos: v.medicamentos!, condiciones: v.condiciones!, grupoSanguineo: v.grupoSanguineo!, tieneCondicion: v.condiciones !== 'Ninguna' };
        }
      }
      this.enviando = false;
      this.showForm = false;
      this.mostrarToast('Información médica actualizada');
    }, 700);
  }

  mostrarToast(msg: string): void {
    this.toastMsg = msg; this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 3000);
  }
}
