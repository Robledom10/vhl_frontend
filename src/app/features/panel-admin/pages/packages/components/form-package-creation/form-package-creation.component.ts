import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { PackageService } from '../../../../../../core/services/package.service';
import { RespuestaPaqueteTuristico, SolicitudPaqueteTuristico } from '../../../../models/package.model';

@Component({
  selector: 'app-form-package-creation',
  templateUrl: './form-package-creation.component.html',
  styleUrl: './form-package-creation.component.css',
})
export class FormPackageCreationComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() editPackage: RespuestaPaqueteTuristico | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<{ action: 'created' | 'updated'; name: string }>();

  currentStep = 1;
  showCalendar = false;
  showTimePicker = false;
  enviando = false;
  showSuccessBanner = false;
  successMessage = '';

  // PREVIEWS
  coverPreview: string | null = null;
  galleryPreview: string[] = [];

  // URLS subidas a Cloudinary
  fotoVerticalUrl = '';
  fotoHorizontalUrl = '';

  // INPUTS TEMPORALES
  newIncluded = '';
  newNotIncluded = '';
  newPolicy = '';
  newRequirement = '';

  showIncludedInput = false;
  showNotIncludedInput = false;
  showPolicyInput = false;
  showRequirementInput = false;

  // HORA
  hours: string[] = [];
  minutes: string[] = [];
  periods = ['AM', 'PM'];
  selectedHour = '';
  selectedMinute = '';
  selectedPeriod = 'AM';

  constructor(
    private fb: FormBuilder,
    private packageService: PackageService,
  ) {}

  packageForm = this.fb.group({
    // STEP 1
    name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(80)]],
    destinations: ['', [Validators.required, Validators.minLength(3)]],
    shortDescription: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(300)]],
    coverImage: this.fb.control<File | null>(null),
    galleryImages: this.fb.control<File[]>([]),

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

    included: this.fb.array([
      this.fb.control('Transporte terrestre ida y regreso'),
      this.fb.control('Hospedaje en hotel 3 estrellas'),
      this.fb.control('Alimentación (desayuno y cena)'),
      this.fb.control('Tours turísticos guiados'),
    ], Validators.required),

    notIncluded: this.fb.array([
      this.fb.control('Gastos personales'),
      this.fb.control('Bebidas alcohólicas'),
      this.fb.control('Compras personales'),
    ], Validators.required),

    // STEP 4
    itinerary: this.fb.array([this.fb.control('', Validators.required)]),

    cancellationPolicies: this.fb.array([
      this.fb.control('Cancelación gratuita hasta 5 días antes del viaje.'),
      this.fb.control('50% de reembolso si cancela 48 horas antes.'),
      this.fb.control('No hay devolución el mismo día del viaje.'),
    ], Validators.required),

    requirements: this.fb.array([
      this.fb.control('Cédula de ciudadanía obligatoria.'),
      this.fb.control('Edad mínima: 5 años.'),
      this.fb.control('Pago completo antes del viaje.'),
    ], Validators.required),
  });

  ngOnInit() {
    this.hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    this.minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    this.updateFileValidators();
    this.packageForm.get('duration')?.valueChanges.subscribe(value => {
      const days = Number(value);
      if (days >= 1) this.syncItineraryWithDuration(days);
    });
  }

  private syncItineraryWithDuration(days: number) {
    while (this.itinerary.length < days) {
      this.itinerary.push(this.fb.control('', Validators.required));
    }
    while (this.itinerary.length > days) {
      this.itinerary.removeAt(this.itinerary.length - 1);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['mode']) {
      this.updateFileValidators();
    }

    if (changes['isOpen'] && this.isOpen && this.mode === 'create') {
      this.resetForm();
    }

    if (changes['editPackage'] && this.editPackage) {
      this.loadPackage(this.editPackage);
    }
  }

  private updateFileValidators() {
    const coverControl = this.packageForm.get('coverImage');
    const galleryControl = this.packageForm.get('galleryImages');

    if (this.mode === 'create') {
      coverControl?.setValidators(Validators.required);
      galleryControl?.setValidators(Validators.required);
    } else {
      coverControl?.clearValidators();
      galleryControl?.clearValidators();
    }

    coverControl?.updateValueAndValidity({ emitEvent: false });
    galleryControl?.updateValueAndValidity({ emitEvent: false });
  }

  private loadPackage(pkg: RespuestaPaqueteTuristico) {
    this.resetForm();
    this.currentStep = 1;
    this.fotoVerticalUrl = pkg.fotoVerticalUrl || '';
    this.fotoHorizontalUrl = pkg.fotoHorizontalUrl || '';
    this.coverPreview = pkg.fotoVerticalUrl || '';
    this.galleryPreview = pkg.fotoHorizontalUrl ? [pkg.fotoHorizontalUrl] : [];

    this.packageForm.patchValue({
      name: pkg.titulo,
      destinations: pkg.destinos?.join(', ') || pkg.destino || '',
      shortDescription: pkg.descripcion || '',
      duration: String(pkg.duracionDias || ''),
      startDate: pkg.fechaInicio,
      departureTime: this.formatTimeForForm(pkg.horaSalida || ''),
      departurePlace: pkg.lugarSalida || '',
      transportType: pkg.tiposTransporte || [pkg.tipoTransporte || 'Bus de turismo'],
      availableSlots: String(pkg.cupo || ''),
      price: String(pkg.precio || ''),
      hotel: pkg.alojamiento || '',
      roomType: pkg.tipoHabitacion || '',
    });

    const includedArray = this.fb.array(pkg.incluye?.map(item => this.fb.control(item)) || [], Validators.required);
    this.packageForm.setControl('included', includedArray);

    const notIncludedArray = this.fb.array(pkg.noIncluye?.map(item => this.fb.control(item)) || [], Validators.required);
    this.packageForm.setControl('notIncluded', notIncludedArray);

    const numDays = pkg.duracionDias || 1;
    const existingTitles = pkg.itinerario?.map(item => item.titulo) || [];
    while (existingTitles.length < numDays) existingTitles.push('');
    const itineraryArray = this.fb.array(
      existingTitles.slice(0, numDays).map(titulo => this.fb.control(titulo, Validators.required))
    );
    this.packageForm.setControl('itinerary', itineraryArray);

    const cancellationArray = this.fb.array(pkg.politicasCancelacion?.map(item => this.fb.control(item)) || [] , Validators.required);
    this.packageForm.setControl('cancellationPolicies', cancellationArray);

    const requirementsArray = this.fb.array(pkg.requisitos?.map(item => this.fb.control(item)) || [
      this.fb.control('Cédula de ciudadanía obligatoria.'),
      this.fb.control('Edad mínima: 5 años.'),
      this.fb.control('Pago completo antes del viaje.'),
    ]);
    this.packageForm.setControl('requirements', requirementsArray);
  }
  get included(): FormArray { return this.packageForm.get('included') as FormArray; }
  get notIncluded(): FormArray { return this.packageForm.get('notIncluded') as FormArray; }
  get itinerary(): FormArray { return this.packageForm.get('itinerary') as FormArray; }
  get cancellationPolicies(): FormArray { return this.packageForm.get('cancellationPolicies') as FormArray; }
  get requirements(): FormArray { return this.packageForm.get('requirements') as FormArray; }

  // STEPS
  nextStep() {
    let controlsToValidate: string[] = [];
    switch (this.currentStep) {
      case 1: controlsToValidate = ['name', 'destinations', 'shortDescription', 'coverImage', 'galleryImages']; break;
      case 2: controlsToValidate = ['duration', 'startDate', 'departureTime', 'departurePlace', 'transportType', 'availableSlots']; break;
      case 3: controlsToValidate = ['price', 'hotel', 'roomType']; break;
    }
    controlsToValidate.forEach(c => this.packageForm.get(c)?.markAsTouched());
    if (controlsToValidate.some(c => this.packageForm.get(c)?.invalid)) return;
    if (this.currentStep < 4) this.currentStep++;
  }

  previousStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  // COVER IMAGE
  onCoverImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.packageForm.patchValue({ coverImage: file });
      this.packageForm.get('coverImage')?.updateValueAndValidity();
      const reader = new FileReader();
      reader.onload = () => { this.coverPreview = reader.result as string; };
      reader.readAsDataURL(file);
    }
  }

  removeCoverImage(event: Event) {
    event.stopPropagation();
    this.coverPreview = null;
    this.fotoVerticalUrl = '';
    this.packageForm.patchValue({ coverImage: null });
    this.packageForm.get('coverImage')?.markAsTouched();
  }

  // GALLERY IMAGES
  onGalleryImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.packageForm.patchValue({ galleryImages: files });
      this.packageForm.get('galleryImages')?.updateValueAndValidity();
      this.galleryPreview = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => { this.galleryPreview.push(reader.result as string); };
        reader.readAsDataURL(file);
      });
    }
  }

  removeGalleryImage(index: number, event: Event) {
    event.stopPropagation();
    this.galleryPreview.splice(index, 1);
    const currentImages = this.packageForm.get('galleryImages')?.value || [];
    currentImages.splice(index, 1);
    this.packageForm.patchValue({ galleryImages: currentImages });
    this.packageForm.get('galleryImages')?.markAsTouched();
  }

  // SUBMIT — primero sube imágenes a Cloudinary, luego crea el paquete
  async submitForm() {
    if (this.packageForm.invalid) {
      this.packageForm.markAllAsTouched();
      return;
    }

    this.enviando = true;
    const formValue = this.packageForm.value;

    try {
      const coverFile = formValue.coverImage as File;
      const galleryFiles = formValue.galleryImages as File[];
      const coverUpload = coverFile
        ? this.packageService.uploadImage(coverFile).toPromise()
        : Promise.resolve({ url: this.fotoVerticalUrl });
      const galleryUpload = galleryFiles && galleryFiles.length > 0
        ? this.packageService.uploadImage(galleryFiles[0]).toPromise()
        : Promise.resolve({ url: this.fotoHorizontalUrl });

      const [coverResp, galleryResp] = await Promise.all([coverUpload, galleryUpload]);
      this.fotoVerticalUrl = coverResp?.url || this.fotoVerticalUrl;
      this.fotoHorizontalUrl = galleryResp?.url || this.fotoHorizontalUrl;

      const destinos = String(formValue.destinations || '').split(',').map((dest: string) => dest.trim()).filter(Boolean);
      const tiposTransporte = formValue.transportType || [];

      const request: SolicitudPaqueteTuristico = {
        titulo: formValue.name?.trim() || '',
        descripcion: formValue.shortDescription?.trim() || '',
        destino: formValue.destinations?.trim() || '',
        destinos: destinos.length ? destinos : [formValue.destinations?.trim() || ''],
        duracionDias: Number(formValue.duration || 1),
        precio: Number(formValue.price || 0),
        cupo: Number(formValue.availableSlots || 1),
        fechaInicio: formValue.startDate || '',
        lugarSalida: formValue.departurePlace?.trim() || '',
        horaSalida: this.formatTimeTo24(formValue.departureTime || ''),
        alojamiento: formValue.hotel?.trim() || '',
        tipoHabitacion: formValue.roomType?.trim() || '',
        tipoTransporte: tiposTransporte?.[0] || 'Bus de turismo',
        tiposTransporte: tiposTransporte,
        fotoVerticalUrl: this.fotoVerticalUrl,
        fotoHorizontalUrl: this.fotoHorizontalUrl,
        incluye: this.included.value as string[],
        noIncluye: this.notIncluded.value as string[],
        politicasCancelacion: this.cancellationPolicies.value as string[],
        requisitos: this.requirements.value as string[],
        itinerario: this.itinerary.controls.map((control, index) => ({
          numeroDia: index + 1,
          titulo: String(control.value || '').trim(),
        })),
      };

      const request$ = this.mode === 'edit' && this.editPackage
        ? this.packageService.updatePackage(this.editPackage.id, request)
        : this.packageService.createPackage(request);

      request$.subscribe({
        next: () => {
          this.enviando = false;
          this.showSuccessBanner = true;
          const savedName = request.titulo;
          const savedAction = this.mode === 'edit' ? 'updated' : 'created';

          this.successMessage = this.mode === 'edit'
            ? `Paquete "${savedName}" actualizado correctamente`
            : `Paquete "${savedName}" creado correctamente`;

          setTimeout(() => {
            this.resetForm();
            this.closeModal();
            this.saved.emit({ action: savedAction, name: savedName });
          }, 1300);
        },
        error: (err) => {
          this.enviando = false;
          console.error(this.mode === 'edit' ? 'Error actualizando paquete:' : 'Error creando paquete:', err);
          alert(`Error: ${err.error?.message || err.message}`);
        }
      });

    } catch (err) {
      this.enviando = false;
      console.error('Error subiendo imágenes:', err);
      alert('Error subiendo las imágenes. Intenta de nuevo.');
    }
  }

  closeModal() {
    this.resetForm();
    this.showSuccessBanner = false;
    this.enviando = false;
    this.closed.emit();
  }

  resetForm() {
    this.packageForm.reset();
    this.packageForm.setControl('included', this.fb.array([
      this.fb.control('Transporte terrestre ida y regreso'),
      this.fb.control('Hospedaje en hotel 3 estrellas'),
      this.fb.control('Alimentación (desayuno y cena)'),
      this.fb.control('Tours turísticos guiados'),
    ], Validators.required));
    this.packageForm.setControl('notIncluded', this.fb.array([
      this.fb.control('Gastos personales'),
      this.fb.control('Bebidas alcohólicas'),
      this.fb.control('Compras personales'),
    ], Validators.required));
    this.packageForm.setControl('itinerary', this.fb.array([this.fb.control('', Validators.required)]));
    this.packageForm.setControl('cancellationPolicies', this.fb.array([
      this.fb.control('Cancelación gratuita hasta 5 días antes del viaje.'),
      this.fb.control('50% de reembolso si cancela 48 horas antes.'),
      this.fb.control('No hay devolución el mismo día del viaje.'),
    ], Validators.required));
    this.packageForm.setControl('requirements', this.fb.array([
      this.fb.control('Cédula de ciudadanía obligatoria.'),
      this.fb.control('Edad mínima: 5 años.'),
      this.fb.control('Pago completo antes del viaje.'),
    ], Validators.required));
    this.packageForm.patchValue({ transportType: [] });
    this.showSuccessBanner = false;
    this.successMessage = '';
    this.coverPreview = null;
    this.galleryPreview = [];
    this.fotoVerticalUrl = '';
    this.fotoHorizontalUrl = '';
    this.currentStep = 1;
    this.newIncluded = '';
    this.newNotIncluded = '';
    this.newPolicy = '';
    this.newRequirement = '';
  }

  // ITINERARIO
  addDay() { this.itinerary.push(this.fb.control('', Validators.required)); }
  removeDay(index: number) { this.itinerary.removeAt(index); }

  // INCLUYE
  saveIncluded() {
    if (!this.newIncluded.trim()) return;
    this.included.push(this.fb.control(this.newIncluded));
    this.newIncluded = '';
    this.showIncludedInput = false;
  }
  removeIncluded(index: number) { this.included.removeAt(index); }

  // NO INCLUYE
  saveNotIncluded() {
    if (!this.newNotIncluded.trim()) return;
    this.notIncluded.push(this.fb.control(this.newNotIncluded));
    this.newNotIncluded = '';
    this.showNotIncludedInput = false;
  }
  removeNotIncluded(index: number) { this.notIncluded.removeAt(index); }

  // POLÍTICAS
  savePolicy() {
    if (!this.newPolicy.trim()) return;
    this.cancellationPolicies.push(this.fb.control(this.newPolicy));
    this.newPolicy = '';
    this.showPolicyInput = false;
  }
  removePolicy(index: number) { this.cancellationPolicies.removeAt(index); }

  // REQUISITOS
  saveRequirement() {
    if (!this.newRequirement.trim()) return;
    this.requirements.push(this.fb.control(this.newRequirement));
    this.newRequirement = '';
    this.showRequirementInput = false;
  }
  removeRequirement(index: number) { this.requirements.removeAt(index); }

  // CALENDARIO
  toggleCalendar(event: Event) { event.stopPropagation(); this.showCalendar = !this.showCalendar; }
  onDateSelected(date: string) {
    this.packageForm.get('startDate')?.setValue(date);
    this.packageForm.get('startDate')?.markAsTouched();
    this.showCalendar = false;
  }

  // TRANSPORTE
  onTransportChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const currentValues = this.packageForm.get('transportType')?.value || [];
    const updatedValues = input.checked
      ? [...currentValues, input.value]
      : currentValues.filter((v: string) => v !== input.value);
    this.packageForm.patchValue({ transportType: updatedValues });
    this.packageForm.get('transportType')?.markAsTouched();
  }

  // HORA
  toggleTimePicker(event: Event) { event.stopPropagation(); this.showTimePicker = !this.showTimePicker; }
  selectHour(hour: string) { this.selectedHour = hour; this.updateTime(); }
  selectMinute(minute: string) { this.selectedMinute = minute; this.updateTime(); }
  selectPeriod(period: string) { this.selectedPeriod = period; this.updateTime(); }
  updateTime() {
    if (this.selectedHour && this.selectedMinute && this.selectedPeriod) {
      const formattedTime = `${this.selectedHour}:${this.selectedMinute} ${this.selectedPeriod}`;
      this.packageForm.get('departureTime')?.setValue(formattedTime);
      this.packageForm.get('departureTime')?.markAsTouched();
      this.showTimePicker = false;
    }
  }

  private formatTimeTo24(time: string): string {
    if (!time) return '';
    const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return time;

    let [_, hour, minute, period] = match;
    let hourNum = Number(hour);
    if (period.toUpperCase() === 'PM' && hourNum < 12) {
      hourNum += 12;
    }
    if (period.toUpperCase() === 'AM' && hourNum === 12) {
      hourNum = 0;
    }
    return `${hourNum.toString().padStart(2, '0')}:${minute}:00`;
  }

  private formatTimeForForm(time: string): string {
    const match = time.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (!match) return time;

    let hourNum = Number(match[1]);
    const minute = match[2];
    const period = hourNum >= 12 ? 'PM' : 'AM';

    if (hourNum === 0) {
      hourNum = 12;
    } else if (hourNum > 12) {
      hourNum -= 12;
    }

    return `${hourNum.toString().padStart(2, '0')}:${minute} ${period}`;
  }
}
