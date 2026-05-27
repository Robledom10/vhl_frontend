import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';

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

  // INPUTS TEMPORALES
  newIncluded = '';
  newNotIncluded = '';
  newPolicy = '';
  newRequirement = '';

  showIncludedInput = false;
  showNotIncludedInput = false;
  showPolicyInput = false;
  showRequirementInput = false;

  constructor(private fb: FormBuilder) {}

  packageForm = this.fb.group({
    // STEP 1
    name: ['', Validators.required],
    destinations: ['', Validators.required],
    shortDescription: ['', Validators.required],

    coverImage: [''],
    galleryImages: [[]],

    // STEP 2
    duration: ['', Validators.required],
    startDate: ['', Validators.required],
    departureTime: ['', Validators.required],
    departurePlace: ['', Validators.required],
    transportType: this.fb.control<string[]>([], Validators.required),
    availableSlots: ['', Validators.required],

    // STEP 3
    price: ['', Validators.required],
    hotel: [''],
    roomType: [''],

    included: this.fb.array([
      this.fb.control('Transporte terrestre ida y regreso'),
      this.fb.control('Hospedaje en hotel 3 estrellas'),
      this.fb.control('Alimentación (desayuno y cena)'),
      this.fb.control('Tours turísticos guiados'),
    ]),

    notIncluded: this.fb.array([
      this.fb.control('Gastos personales'),
      this.fb.control('Bebidas alcohólicas'),
      this.fb.control('Compras personales'),
    ]),

    // STEP 4
    itinerary: this.fb.array([this.fb.control('')]),

    cancellationPolicies: this.fb.array([
      this.fb.control('Cancelación gratuita hasta 5 días antes del viaje.'),
      this.fb.control('50% de reembolso si cancela 48 horas antes.'),
      this.fb.control('No hay devolución el mismo día del viaje.'),
    ]),

    requirements: this.fb.array([
      this.fb.control('Cédula de ciudadanía obligatoria.'),
      this.fb.control('Edad mínima: 5 años.'),
      this.fb.control('Pago completo antes del viaje.'),
    ]),
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
    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  closeModal() {
    this.closed.emit();
  }

  submitForm() {
    console.log(this.packageForm.value);
  }

  // ITINERARIO
  addDay() {
    this.itinerary.push(this.fb.control(''));
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

  //   CALENDARIO
  toggleCalendar(event: Event) {
    event.stopPropagation();
    this.showCalendar = !this.showCalendar;
  }

  onDateSelected(date: string) {
    this.packageForm.patchValue({
      startDate: date,
    });

    this.showCalendar = false;
  }

  onTransportChange(event: Event) {
    const input = event.target as HTMLInputElement;

    const currentValues = this.packageForm.get('transportType')?.value || [];

    let updatedValues: string[];

    if (input.checked) {
      updatedValues = [...currentValues, input.value];
    } else {
      updatedValues = currentValues.filter((value) => value !== input.value);
    }

    this.packageForm.patchValue({
      transportType: updatedValues,
    });
  }
}
