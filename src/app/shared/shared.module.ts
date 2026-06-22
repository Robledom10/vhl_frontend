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

@NgModule({
	declarations: [
		NavbarComponent,
		SearchFilterComponent,
		PackagesCardComponent,
		FooterComponent,
		PackageDetailSheetComponent,
		CustomCalendarComponent,
		ReservationWizardComponent,
  StatsSectionComponent
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
		ReservationWizardComponent
	],
})
export class SharedModule { }
