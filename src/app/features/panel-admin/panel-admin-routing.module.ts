import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PanelAdmin } from './panel-admin';
import { CommentsComponent } from './pages/comments/comments.component';
import { ControlPanelComponent } from './pages/control-panel/control-panel.component';
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
import { GalleryAdminComponent } from './pages/gallery-admin/gallery-admin.component';
import { DashboardOperativoComponent } from './pages/operaciones/pages/dashboard-operativo/dashboard-operativo.component';
import { AsignarTransporteComponent } from './pages/operaciones/pages/asignar-transporte/asignar-transporte.component';
import { CheckInQrComponent } from './pages/operaciones/pages/check-in-qr/check-in-qr.component';
import { AsignarAlojamientoComponent } from './pages/operaciones/pages/asignar-alojamiento/asignar-alojamiento.component';
import { InfoMedicaComponent } from './pages/operaciones/pages/info-medica/info-medica.component';
import { ContactosEmergenciaComponent } from './pages/operaciones/pages/contactos-emergencia/contactos-emergencia.component';
import { IncidentesComponent } from './pages/operaciones/pages/incidentes/incidentes.component';
import { ComunicacionesComponent } from './pages/operaciones/pages/comunicaciones/comunicaciones.component';

const routes: Routes = [
	{
		path: '',
		component: PanelAdmin,
		children: [
			{ path: '', redirectTo: 'profile', pathMatch: 'full' },
			{ path: 'control-panel', component: ControlPanelComponent },
			{ path: 'packages', component: PackagesComponent },
			{ path: 'packages-organization-profile', component: OrganizationProfileComponent },
			{ path: 'packages-price-plans', component: PricingPlanComponent },
			{ path: 'packages-providers', component: ProveedorComponent },
			{ path: 'packages-seguros', component: SegurosComponent },
			{ path: 'reservations', component: ReservationsComponent },
			{ path: 'users-roles', component: UsersRolesComponent },
			{ path: 'comments', component: CommentsComponent },
			{ path: 'gallery-admin', component: GalleryAdminComponent },
			{ path: 'messages', component: MessagesComponent },
			{ path: 'offers', component: OffersComponent },
			{ path: 'profile', component: ProfileComponent },
			{ path: 'operaciones-dashboard', component: DashboardOperativoComponent },
			{ path: 'operaciones-transporte', component: AsignarTransporteComponent },
			{ path: 'operaciones-check-in', component: CheckInQrComponent },
			{ path: 'operaciones-alojamiento', component: AsignarAlojamientoComponent },
			{ path: 'operaciones-info-medica', component: InfoMedicaComponent },
			{ path: 'operaciones-contactos', component: ContactosEmergenciaComponent },
			{ path: 'operaciones-incidentes', component: IncidentesComponent },
			{ path: 'operaciones-comunicaciones', component: ComunicacionesComponent },
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class PanelAdminRoutingModule { }
