import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryRoutingModule } from './gallery-routing.module';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { SharedModule } from "../../shared/shared-module";
import { FilterGalleryComponent } from './components/filter-gallery/filter-gallery.component';


@NgModule({
  declarations: [
    GalleryComponent,
    FilterGalleryComponent
  ],
  imports: [
    CommonModule,
    GalleryRoutingModule,
    SharedModule
]
})
export class GalleryModule { }