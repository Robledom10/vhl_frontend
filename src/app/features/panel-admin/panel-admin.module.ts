import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "../../shared/shared-module";
import { PanelAdminRoutingModule } from './panel-admin-routing.module';
import { PanelAdmin } from './panel-admin';
import { NavbarPanelAdminComponent } from './components/navbar-panel-admin/navbar-panel-admin.component';


@NgModule({
  declarations: [
    PanelAdmin,
	NavbarPanelAdminComponent
  ],
  imports: [
    CommonModule,
    PanelAdminRoutingModule,
	SharedModule
  ]
})
export class PanelAdminModule { }
