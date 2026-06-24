import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PanelAdmin } from './panel-admin';
import { CommentsComponent } from './pages/packages/pages/comments/comments.component';
import { ControlPanelComponent } from './pages/control-panel/control-panel.component';
import { PackagesComponent } from './pages/packages/packages.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ReservationsComponent } from './pages/reservations/reservations.component';
import { UsersRolesComponent } from './pages/users-roles/users-roles.component';
import { ProveedorComponent } from './pages/packages/pages/proveedor/proveedor.component';
import { GalleryAdminComponent } from './pages/gallery-admin/gallery-admin.component';
import { DashboardOperativoComponent } from './pages/operation/pages/operations-dashboard/operations-dashboard.component';
import { AsignarTransporteComponent } from './pages/operation/pages/assign-transport/assign-transport.component';
import { CheckInQrComponent } from './pages/operation/pages/check-in-qr/check-in-qr.component';
import { AsignarAlojamientoComponent } from './pages/operation/pages/assign-accommodation/assign-accommodation.component';
import { InfoMedicaComponent } from './pages/operation/pages/medical-info/medical-info.component';
import { ComunicacionesComponent } from './pages/operation/pages/communications/communications.component';

const routes: Routes = [
	{
		path: '',
		component: PanelAdmin,
		children: [
			{ path: '', redirectTo: 'profile', pathMatch: 'full' },
			{ path: 'control-panel', component: ControlPanelComponent },
			{ path: 'packages', component: PackagesComponent },
			{ path: 'packages', component: PackagesComponent },
			{ path: 'packages-providers', component: ProveedorComponent },
			{ path: 'reservations', component: ReservationsComponent },
			{ path: 'users-roles', component: UsersRolesComponent },
			{ path: 'comments', component: CommentsComponent },
			{ path: 'gallery-admin', component: GalleryAdminComponent },
			{ path: 'profile', component: ProfileComponent },
			{ path: 'operaciones-dashboard', component: DashboardOperativoComponent },
			{ path: 'operaciones-transporte', component: AsignarTransporteComponent },
			{ path: 'operaciones-check-in', component: CheckInQrComponent },
			{ path: 'operaciones-alojamiento', component: AsignarAlojamientoComponent },
			{ path: 'operaciones-info-medica', component: InfoMedicaComponent },
			{ path: 'operaciones-comunicaciones', component: ComunicacionesComponent },
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class PanelAdminRoutingModule { }
