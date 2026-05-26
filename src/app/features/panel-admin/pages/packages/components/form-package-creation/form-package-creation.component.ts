import { Component, EventEmitter, Input, Output } from '@angular/core';
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
    transportType: ['', Validators.required],
    availableSlots: ['', Validators.required],

    // STEP 3
    price: ['', Validators.required],
    hotel: [''],
    roomType: [''],

    included: this.fb.array([]),
    notIncluded: this.fb.array([]),

    // STEP 4
    itinerary: this.fb.array([this.fb.control('')]),
    cancellationPolicies: this.fb.array([]),
    requirements: this.fb.array([]),
  });

  get included(): FormArray {
    return this.packageForm.get('included') as FormArray;
  }

  get notIncluded(): FormArray {
    return this.packageForm.get('notIncluded') as FormArray;
  }

  get itinerary(): FormArray {
    return this.packageForm.get('itinerary') as FormArray;
  }

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

  addDay() {
    this.itinerary.push(this.fb.control(''));
  }

  removeDay(index: number) {
    this.itinerary.removeAt(index);
  }
}
