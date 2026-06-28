import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { SearchFilterComponent } from './search-filter/search-filter.component';
import { FormsModule } from '@angular/forms';
import { PackagesCardComponent } from './packages-card/packages-card.component';
import { FooterComponent } from './footer/footer.component';
import { PackageDetailSheetComponent } from './package-detail-sheet/package-detail-sheet.component';
import { CustomCalendarComponent } from './custom-calendar/custom-calendar.component';
import { ReservationWizardComponent } from './reservation-wizard/reservation-wizard.component';
import { StatsSectionComponent } from './stats-section/stats-section.component';
import { NextTripBannerComponent } from './next-trip-banner/next-trip-banner.component';
import { TestimonialSliderComponent } from './testimonial-slider/testimonial-slider.component';
import { ConfirmModalComponent } from './confirm-modal/confirm-modal.component';
import { ToastNotificationComponent } from './toast-notification/toast-notification.component';
import { TermsModalComponent } from './terms-modal/terms-modal.component';

@NgModule({
	declarations: [
		NavbarComponent,
		SearchFilterComponent,
		PackagesCardComponent,
		FooterComponent,
		PackageDetailSheetComponent,
		CustomCalendarComponent,
		ReservationWizardComponent,
		StatsSectionComponent,
		NextTripBannerComponent,
		TestimonialSliderComponent,
		ConfirmModalComponent,
		ToastNotificationComponent,
		TermsModalComponent,
	],
	imports: [
		CommonModule,
		RouterModule,
		FormsModule
	],
	exports: [
		NavbarComponent,
		SearchFilterComponent,
		PackagesCardComponent,
		FooterComponent,
		PackageDetailSheetComponent,
		CustomCalendarComponent,
		ReservationWizardComponent,
		StatsSectionComponent,
		NextTripBannerComponent,
		TestimonialSliderComponent,
		ConfirmModalComponent,
		ToastNotificationComponent,
		TermsModalComponent,
	],
})
export class SharedModule { }
