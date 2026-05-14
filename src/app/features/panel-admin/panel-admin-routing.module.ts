import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PanelAdmin } from './panel-admin';
import { CommentsComponent } from './pages/comments/comments.component';
import { ControlPanelComponent } from './pages/control-panel/control-panel.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { MessagesComponent } from './pages/messages/messages.component';
import { OffersComponent } from './pages/offers/offers.component';
import { PackagesComponent } from './pages/packages/packages.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ReservationsComponent } from './pages/reservations/reservations.component';
import { UsersRolesComponent } from './pages/users-roles/users-roles.component';

const routes: Routes = [
  {
    path: '',
    component: PanelAdmin,
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'control-panel', component: ControlPanelComponent },
      { path: 'packages', component: PackagesComponent },
      { path: 'reservations', component: ReservationsComponent },
      { path: 'users-roles', component: UsersRolesComponent },
      { path: 'comments', component: CommentsComponent },
      { path: 'admin-gallery', component: GalleryComponent },
      { path: 'messages', component: MessagesComponent },
      { path: 'offers', component: OffersComponent },
      { path: 'profile', component: ProfileComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PanelAdminRoutingModule {}
