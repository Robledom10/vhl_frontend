import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { SharedModule } from '../../shared/shared.module';
import { InteractiveMapComponent } from './components/interactive-map/interactive-map.component';
import { FormsModule } from '@angular/forms';
import { SliderWorkTeamComponent } from './components/slider-work-team/slider-work-team.component';

@NgModule({
	declarations: [
		HomeComponent,
		InteractiveMapComponent,
		SliderWorkTeamComponent,
	],
	imports: [
		CommonModule,
		HomeRoutingModule,
		SharedModule,
		FormsModule,
	]
})
export class HomeModule { }