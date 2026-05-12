import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PanelAdminRoutingModule } from './panel-admin-routing-module';
import { PanelAdmin } from './panel-admin';


@NgModule({
  declarations: [
    PanelAdmin
  ],
  imports: [
    CommonModule,
    PanelAdminRoutingModule
  ]
})
export class PanelAdminModule { }
