import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { MediaResponse, MediaService } from '../../../../core/services/media.service';

@Component({
	selector: 'app-gallery-admin',
	templateUrl: './gallery-admin.component.html',
	styleUrl: './gallery-admin.component.css',
})
export class GalleryAdminComponent implements OnInit {
	mediaList: MediaResponse[] = [];
	filteredMedia: MediaResponse[] = [];
	groupedMedia: { [key: string]: MediaResponse[] } = {};
	showModal = false;
	loading = false;
	searchTerm = '';
	selectedYear = '';
	selectedExcursion = '';
	selectedActivity = '';
	selectedType = '';
	yearDropdownOpen = false;
	excursionDropdownOpen = false;
	activityDropdownOpen = false;
	typeDropdownOpen = false;
	selectedMedia: MediaResponse | null = null;
	years: number[] = [];
	excursions: string[] = [];
	activities: string[] = [];

	//   Modal de notificación
	showToast = false;
	toastTitle = '';
	toastMessage = '';

	//   Para eliminar una imagen
	showDeleteModal = false;
	selectedMediaToDelete: MediaResponse | null = null;

	sortYearsDesc = (a: any, b: any): number => {
		return Number(b.key) - Number(a.key);
	};

	constructor(private mediaService: MediaService, private elementRef: ElementRef) { }

	ngOnInit(): void {
		this.loadMedia();
	}

	loadMedia() {
		this.loading = true;

		this.mediaService.getAll().subscribe({
			next: (data) => {
				this.mediaList = data;
				this.filteredMedia = data;
				this.extractFilters();
				this.groupMedia();
				this.loading = false;
			},

			error: (err) => {
				console.error(err);
				this.loading = false;
			},
		});
	}

	extractFilters() {
		const currentYear = new Date().getFullYear();

		this.years = [];

		for (let year = currentYear; year >= 2023; year--) {
			this.years.push(year);
		}

		this.excursions = [...new Set(this.mediaList.map((m) => m.excursion))];
		this.activities = [...new Set(this.mediaList.map((m) => m.activity))];
	}

	applyFilters() {
		this.filteredMedia = this.mediaList.filter((media) => {
			const matchesSearch = media.excursion
				.toLowerCase()
				.includes(this.searchTerm.toLowerCase());

			const matchesYear =
				!this.selectedYear || media.year.toString() === this.selectedYear;

			const matchesExcursion =
				!this.selectedExcursion || media.excursion === this.selectedExcursion;

			const matchesLocation =
				!this.selectedActivity || media.activity === this.selectedActivity;

			const matchesType =
				!this.selectedType || media.type === this.selectedType;

			return (
				matchesSearch &&
				matchesYear &&
				matchesExcursion &&
				matchesLocation &&
				matchesType
			);
		});

		this.groupMedia();
	}

	groupMedia() {
		this.groupedMedia = {};

		this.filteredMedia.forEach((media) => {
			const year = media.year.toString();

			if (!this.groupedMedia[year]) {
				this.groupedMedia[year] = [];
			}

			this.groupedMedia[year].push(media);
		});
	}

	get selectedTypeLabel(): string {
		if (this.selectedType === 'IMAGE') return 'Imagen';
		if (this.selectedType === 'VIDEO') return 'Video';
		return 'Actividad';
	}

	openModal() {
		this.showModal = true;
		document.body.style.overflow = 'hidden';
	}

	closeModal(success: boolean = false) {
		const wasEditing = !!this.selectedMedia;

		this.showModal = false;
		this.selectedMedia = null;
		document.body.style.overflow = '';

		if (success) {
			this.toastTitle = wasEditing ? 'Archivo actualizado' : 'Archivo agregado';

			this.toastMessage = wasEditing
				? 'El archivo fue actualizado correctamente.'
				: 'El archivo fue agregado correctamente.';

			this.showToast = true;

			setTimeout(() => {
				this.showToast = false;
			}, 3000);
		}

		this.loadMedia();
	}

	editMedia(media: MediaResponse) {
		this.selectedMedia = media;
		this.showModal = true;
		document.body.style.overflow = 'hidden';
	}

	toggleExcursionDropdown(): void {
		const newState = !this.excursionDropdownOpen;
		this.closeAllDropdowns();
		this.excursionDropdownOpen = newState;
	}

	toggleYearDropdown(): void {
		const newState = !this.yearDropdownOpen;
		this.closeAllDropdowns();
		this.yearDropdownOpen = newState;
	}

	toggleActivityropdown(): void {
		const newState = !this.activityDropdownOpen;
		this.closeAllDropdowns();
		this.activityDropdownOpen = newState;
	}

	toggleTypeDropdown(): void {
		const newState = !this.typeDropdownOpen;
		this.closeAllDropdowns();
		this.typeDropdownOpen = newState;
	}

	selectYear(year: string) {
		this.selectedYear = year;
		this.yearDropdownOpen = false;
		this.applyFilters();
	}

	selectActivity(activity: string) {
		this.selectedActivity = activity;
		this.activityDropdownOpen = false;
		this.applyFilters();
	}

	selectType(type: string) {
		this.selectedType = type;
		this.typeDropdownOpen = false;
		this.applyFilters();
	}

	selectExcursion(excursion: string) {
		this.selectedExcursion = excursion;
		this.excursionDropdownOpen = false;
		this.applyFilters();
	}

	//   Modal para eliminar una imagen
	openDeleteModal(media: MediaResponse) {
		this.selectedMediaToDelete = media;
		this.showDeleteModal = true;
		document.body.style.overflow = 'hidden';
	}

	closeDeleteModal() {
		this.showDeleteModal = false;
		document.body.style.overflow = '';
		this.selectedMediaToDelete = null;
	}

	confirmDelete() {
		if (!this.selectedMediaToDelete) return;

		this.mediaService.deleteMedia(this.selectedMediaToDelete.id).subscribe({
			next: () => {
				this.showDeleteModal = false;
				document.body.style.overflow = '';

				this.toastTitle = 'Archivo eliminado';
				this.toastMessage = 'El archivo fue eliminado correctamente.';
				this.showToast = true;

				setTimeout(() => {
					this.showToast = false;
				}, 3000);

				this.selectedMediaToDelete = null;
				this.loadMedia();
			},

			error: (err) => {
				console.error(err);
			},
		});
	}

	closeAllDropdowns(): void {
		this.yearDropdownOpen = false;
		this.activityDropdownOpen = false;
		this.excursionDropdownOpen = false;
		this.typeDropdownOpen = false;
	}

	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent): void {

		const target = event.target as HTMLElement;

		const clickedFilter = target.closest('.filter-wrapper');

		if (!clickedFilter) {
			this.closeAllDropdowns();
		}
	}
}