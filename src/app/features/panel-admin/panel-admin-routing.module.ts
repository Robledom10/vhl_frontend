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
import { SegurosComponent } from './pages/packages/pages/seguros/seguros.component';
import { ProveedorComponent } from './pages/packages/pages/proveedor/proveedor.component';
import { PricingPlanComponent } from './pages/packages/pages/pricing-plan/pricing-plan.component';
import { OrganizationProfileComponent } from './pages/packages/pages/organization-profile/organization-profile.component';

const routes: Routes = [
  {
    path: '',
    component: PanelAdmin,
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'control-panel', component: ControlPanelComponent },
      { path: 'packages', component: PackagesComponent },
      { path: 'packages', component: PackagesComponent },
	  { path: 'packages-organization-profile', component: OrganizationProfileComponent },
	  { path: 'packages-price-plans', component: PricingPlanComponent },
	  { path: 'packages-providers', component: ProveedorComponent },
	  { path: 'packages-seguros', component: SegurosComponent },
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
