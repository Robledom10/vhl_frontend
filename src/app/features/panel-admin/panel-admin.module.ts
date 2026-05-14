import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared-module';
import { PanelAdminRoutingModule } from './panel-admin-routing.module';
import { PanelAdmin } from './panel-admin';
import { NavbarPanelAdminComponent } from './components/navbar-panel-admin/navbar-panel-admin.component';
import { ControlPanelComponent } from './pages/control-panel/control-panel.component';
import { PackagesComponent } from './pages/packages/packages.component';
import { ReservationsComponent } from './pages/reservations/reservations.component';
import { UsersRolesComponent } from './pages/users-roles/users-roles.component';
import { CommentsComponent } from './pages/comments/comments.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { MessagesComponent } from './pages/messages/messages.component';
import { OffersComponent } from './pages/offers/offers.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    PanelAdmin,
    NavbarPanelAdminComponent,
    ControlPanelComponent,
    PackagesComponent,
    ReservationsComponent,
    UsersRolesComponent,
    CommentsComponent,
    GalleryComponent,
    MessagesComponent,
    OffersComponent,
    ProfileComponent,
  ],
  imports: [
    CommonModule,
    PanelAdminRoutingModule,
    SharedModule,
    RouterModule,
    ReactiveFormsModule,
  ],
})
export class PanelAdminModule {}
