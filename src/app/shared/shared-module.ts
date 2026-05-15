import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { SearchFilterComponent } from './search-filter/search-filter.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PackagesCardComponent } from './packages-card/packages-card.component';
import { FooterComponent } from './footer/footer.component';
import { PackageDetailSheetComponent } from './package-detail-sheet/package-detail-sheet.component';
import { CustomCalendarComponent } from './custom-calendar/custom-calendar.component';

@NgModule({
  declarations: [
    NavbarComponent,
    SearchFilterComponent,
    PackagesCardComponent,
    FooterComponent,
	PackageDetailSheetComponent,
	CustomCalendarComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
	FormsModule
  ],
  exports: [
    NavbarComponent,
    SearchFilterComponent,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    PackagesCardComponent,
    FooterComponent,
	CustomCalendarComponent
  ],
})
export class SharedModule {}
