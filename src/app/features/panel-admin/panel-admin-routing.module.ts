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
import { DashboardOperativoComponent } from './pages/operaciones/pages/operations-dashboard/operations-dashboard.component';
import { AsignarTransporteComponent } from './pages/operaciones/pages/assign-transport/assign-transport.component';
import { CheckInQrComponent } from './pages/operaciones/pages/check-in-qr/check-in-qr.component';
import { AsignarAlojamientoComponent } from './pages/operaciones/pages/assign-accommodation/assign-accommodation.component';
import { InfoMedicaComponent } from './pages/operaciones/pages/medical-info/medical-info.component';
import { IncidentesComponent } from './pages/operaciones/pages/incidents/incidents.component';
import { ComunicacionesComponent } from './pages/operaciones/pages/communications/communications.component';
import { AsignarRestauranteComponent } from './pages/operaciones/pages/assign-restaurant/assign-restaurant.component';

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
			{ path: 'profile', component: ProfileComponent },
			{ path: 'operaciones-dashboard', component: DashboardOperativoComponent },
			{ path: 'operaciones-transporte', component: AsignarTransporteComponent },
			{ path: 'operaciones-check-in', component: CheckInQrComponent },
			{ path: 'operaciones-alojamiento', component: AsignarAlojamientoComponent },
			{ path: 'operaciones-info-medica', component: InfoMedicaComponent },
			{ path: 'operaciones-incidentes', component: IncidentesComponent },
			{ path: 'operaciones-comunicaciones', component: ComunicacionesComponent },
			{ path: 'operaciones-restaurantes', component: AsignarRestauranteComponent },
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class PanelAdminRoutingModule { }
