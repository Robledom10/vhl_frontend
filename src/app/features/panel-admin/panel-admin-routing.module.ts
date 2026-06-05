import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PanelAdmin } from './panel-admin';
import { CommentsComponent } from './pages/comments/comments.component';
import { ControlPanelComponent } from './pages/control-panel/control-panel.component';
import { MessagesComponent } from './pages/messages/messages.component';
import { PackagesComponent } from './pages/packages/packages.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ReservationsComponent } from './pages/reservations/reservations.component';
import { UsersRolesComponent } from './pages/users-roles/users-roles.component';
import { ProveedorComponent } from './pages/packages/pages/proveedor/proveedor.component';
import { PricingPlanComponent } from './pages/packages/pages/pricing-plan/pricing-plan.component';
import { GalleryAdminComponent } from './pages/gallery-admin/gallery-admin.component';
import { TravelOperationComponent } from './pages/travel-operation/travel-operation.component';

const routes: Routes = [
	{
		path: '',
		component: PanelAdmin,
		children: [
			{ path: '', redirectTo: 'profile', pathMatch: 'full' },
			{ path: 'control-panel', component: ControlPanelComponent },
			{ path: 'packages', component: PackagesComponent },
			{ path: 'packages', component: PackagesComponent },
			{ path: 'packages-price-plans', component: PricingPlanComponent },
			{ path: 'packages-providers', component: ProveedorComponent },
			{ path: 'reservations', component: ReservationsComponent },
			{ path: 'users-roles', component: UsersRolesComponent },
			{ path: 'comments', component: CommentsComponent },
			{ path: 'gallery-admin', component: GalleryAdminComponent },
			{ path: 'messages', component: MessagesComponent },
			{ path: 'travel-operation', component: TravelOperationComponent },
			{ path: 'profile', component: ProfileComponent },
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class PanelAdminRoutingModule { }
