import { Component, EventEmitter, Input, Output } from '@angular/core';

import { FormArray, FormBuilder, Validators } from '@angular/forms';

import { PackageService } from '../../../../../../core/services/package.service';

import { SolicitudPaqueteTuristico } from '../../../../models/package.model';

@Component({
  selector: 'app-form-package-creation',
  templateUrl: './form-package-creation.component.html',
  styleUrl: './form-package-creation.component.css',
})
export class FormPackageCreationComponent {
  @Input() isOpen = false;

  @Output() closed = new EventEmitter<void>();

  currentStep = 1;

  showCalendar = false;

  // PREVIEWS
  coverPreview: string | null = null;
  galleryPreview: string[] = [];

  // INPUTS TEMPORALES
  newIncluded = '';
  newNotIncluded = '';
  newPolicy = '';
  newRequirement = '';

  showIncludedInput = false;
  showNotIncludedInput = false;
  showPolicyInput = false;
  showRequirementInput = false;

  constructor(
    private fb: FormBuilder,
    private packageService: PackageService,
  ) {}

  packageForm = this.fb.group({
    idCategoria: [1, Validators.required],

    // STEP 1
    name: [
      '',
      [Validators.required, Validators.minLength(5), Validators.maxLength(80)],
    ],

    destinations: ['', [Validators.required, Validators.minLength(3)]],

    shortDescription: [
      '',
      [
        Validators.required,
        Validators.minLength(20),
        Validators.maxLength(300),
      ],
    ],

    coverImage: this.fb.control<File | null>(null, Validators.required),

    galleryImages: this.fb.control<File[]>([], Validators.required),

    // STEP 2
    duration: ['', [Validators.required, Validators.min(1)]],

    startDate: ['', Validators.required],

    departureTime: ['', Validators.required],

    departurePlace: ['', [Validators.required, Validators.minLength(3)]],

    transportType: this.fb.control<string[]>([], Validators.required),

    availableSlots: ['', [Validators.required, Validators.min(1)]],

    // STEP 3
    price: ['', [Validators.required, Validators.min(10000)]],

    hotel: ['', [Validators.required, Validators.minLength(3)]],

    roomType: ['', [Validators.required, Validators.minLength(3)]],

    included: this.fb.array(
      [
        this.fb.control('Transporte terrestre ida y regreso'),
        this.fb.control('Hospedaje en hotel 3 estrellas'),
        this.fb.control('Alimentación (desayuno y cena)'),
        this.fb.control('Tours turísticos guiados'),
      ],
      Validators.required,
    ),

    notIncluded: this.fb.array(
      [
        this.fb.control('Gastos personales'),
        this.fb.control('Bebidas alcohólicas'),
        this.fb.control('Compras personales'),
      ],
      Validators.required,
    ),

    // STEP 4
    itinerary: this.fb.array([this.fb.control('', Validators.required)]),

    cancellationPolicies: this.fb.array(
      [
        this.fb.control('Cancelación gratuita hasta 5 días antes del viaje.'),
        this.fb.control('50% de reembolso si cancela 48 horas antes.'),
        this.fb.control('No hay devolución el mismo día del viaje.'),
      ],
      Validators.required,
    ),

    requirements: this.fb.array(
      [
        this.fb.control('Cédula de ciudadanía obligatoria.'),
        this.fb.control('Edad mínima: 5 años.'),
        this.fb.control('Pago completo antes del viaje.'),
      ],
      Validators.required,
    ),
  });

  // GETTERS
  get included(): FormArray {
    return this.packageForm.get('included') as FormArray;
  }

  get notIncluded(): FormArray {
    return this.packageForm.get('notIncluded') as FormArray;
  }

  get itinerary(): FormArray {
    return this.packageForm.get('itinerary') as FormArray;
  }

  get cancellationPolicies(): FormArray {
    return this.packageForm.get('cancellationPolicies') as FormArray;
  }

  get requirements(): FormArray {
    return this.packageForm.get('requirements') as FormArray;
  }

  // STEPS
  nextStep() {
    let controlsToValidate: string[] = [];

    switch (this.currentStep) {
      case 1:
        controlsToValidate = [
          'name',
          'destinations',
          'shortDescription',
          'coverImage',
          'galleryImages',
        ];
        break;

      case 2:
        controlsToValidate = [
          'duration',
          'startDate',
          'departureTime',
          'departurePlace',
          'transportType',
          'availableSlots',
        ];
        break;

      case 3:
        controlsToValidate = ['price', 'hotel', 'roomType'];
        break;
    }

    controlsToValidate.forEach((controlName) => {
      this.packageForm.get(controlName)?.markAsTouched();
    });

    const hasErrors = controlsToValidate.some(
      (controlName) => this.packageForm.get(controlName)?.invalid,
    );

    if (hasErrors) return;

    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // COVER
  onCoverImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      this.packageForm.patchValue({
        coverImage: file,
      });

      this.packageForm.get('coverImage')?.updateValueAndValidity();

      const reader = new FileReader();

      reader.onload = () => {
        this.coverPreview = reader.result as string;
      };

      reader.readAsDataURL(file);
    }
  }

  // GALLERY
  onGalleryImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);

      this.packageForm.patchValue({
        galleryImages: files,
      });

      this.packageForm.get('galleryImages')?.updateValueAndValidity();

      this.galleryPreview = [];

      files.forEach((file) => {
        const reader = new FileReader();

        reader.onload = () => {
          this.galleryPreview.push(reader.result as string);
        };

        reader.readAsDataURL(file);
      });
    }
  }

  closeModal() {
    this.closed.emit();
  }

  submitForm() {
    if (this.packageForm.invalid) {
      console.log(this.packageForm.value);
      console.log(this.packageForm.errors);

      this.packageForm.markAllAsTouched();

      return;
    }

    const formValue = this.packageForm.value;

    const request: SolicitudPaqueteTuristico = {
      titulo: formValue.name?.trim() || '',
      descripcion: formValue.shortDescription?.trim() || '',
      destino: formValue.destinations?.trim() || '',

      duracionDias: Number(formValue.duration || 1),
      precio: Number(formValue.price || 0),
      cupo: Number(formValue.availableSlots || 1),

      fechaInicio: formValue.startDate || '',
      fechaFin: formValue.startDate || '',

      lugarSalida: formValue.departurePlace?.trim() || '',

      horaSalida: formValue.departureTime || '',

      alojamiento: formValue.hotel?.trim() || '',
      tipoHabitacion: formValue.roomType?.trim() || '',

      tipoTransporte: formValue.transportType?.[0] || 'Bus de turismo',

      fotoVerticalUrl: '',
      fotoHorizontalUrl: '',

      incluye: this.included.value as string[],
      noIncluye: this.notIncluded.value as string[],

      politicasCancelacion: this.cancellationPolicies.value as string[],

      idCategoria: 1,

      itinerario: this.itinerary.controls.map((control, index) => ({
        numeroDia: index + 1,
        titulo: String(control.value || '').trim(),
      })),
    };

    this.packageService.createPackage(request).subscribe({
      next: () => {
        alert('Paquete creado correctamente');

        this.packageForm.reset();

        this.currentStep = 1;

        this.closeModal();
      },

      error: (err) => {
        console.error('ERROR COMPLETO:', err);

        console.log('Status:', err.status);
        console.log('Mensaje:', err.message);
        console.log('Error backend:', err.error);

        alert(`
Status: ${err.status}

Mensaje:
${err.error?.message || err.message}

Detalle:
${JSON.stringify(err.error, null, 2)}
  `);
      },
    });
  }

  // ITINERARIO
  addDay() {
    this.itinerary.push(this.fb.control('', Validators.required));
  }

  removeDay(index: number) {
    this.itinerary.removeAt(index);
  }

  // INCLUYE
  saveIncluded() {
    if (!this.newIncluded.trim()) return;

    this.included.push(this.fb.control(this.newIncluded));

    this.newIncluded = '';
    this.showIncludedInput = false;
  }

  removeIncluded(index: number) {
    this.included.removeAt(index);
  }

  // NO INCLUYE
  saveNotIncluded() {
    if (!this.newNotIncluded.trim()) return;

    this.notIncluded.push(this.fb.control(this.newNotIncluded));

    this.newNotIncluded = '';
    this.showNotIncludedInput = false;
  }

  removeNotIncluded(index: number) {
    this.notIncluded.removeAt(index);
  }

  // POLITICAS
  savePolicy() {
    if (!this.newPolicy.trim()) return;

    this.cancellationPolicies.push(this.fb.control(this.newPolicy));

    this.newPolicy = '';
    this.showPolicyInput = false;
  }

  removePolicy(index: number) {
    this.cancellationPolicies.removeAt(index);
  }

  // REQUISITOS
  saveRequirement() {
    if (!this.newRequirement.trim()) return;

    this.requirements.push(this.fb.control(this.newRequirement));

    this.newRequirement = '';
    this.showRequirementInput = false;
  }

  removeRequirement(index: number) {
    this.requirements.removeAt(index);
  }

  // CALENDARIO
  toggleCalendar(event: Event) {
    event.stopPropagation();

    this.showCalendar = !this.showCalendar;
  }

  onDateSelected(date: string) {
    this.packageForm.get('startDate')?.setValue(date);

    this.packageForm.get('startDate')?.markAsTouched();

    this.showCalendar = false;
  }

  // TRANSPORT
  onTransportChange(event: Event) {
    const input = event.target as HTMLInputElement;

    const currentValues = this.packageForm.get('transportType')?.value || [];

    let updatedValues: string[];

    if (input.checked) {
      updatedValues = [...currentValues, input.value];
    } else {
      updatedValues = currentValues.filter((v) => v !== input.value);
    }

    this.packageForm.patchValue({
      transportType: updatedValues,
    });

    this.packageForm.get('transportType')?.markAsTouched();
  }
}
