import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DestinationsRoutingModule } from './destinations-routing.module';
import { DestinationsComponent } from './pages/destinations/destinations.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
    DestinationsComponent
  ],
  imports: [
    CommonModule,
    DestinationsRoutingModule,
	SharedModule
  ]
})
export class DestinationsModule { }
