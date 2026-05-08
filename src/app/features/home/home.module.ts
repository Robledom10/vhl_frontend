import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { SharedModule } from '../../shared/shared-module';
import { InteractiveMapComponent } from './components/interactive-map/interactive-map.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    HomeComponent,
    InteractiveMapComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule, 
    FormsModule
  ]
})
export class HomeModule { }
