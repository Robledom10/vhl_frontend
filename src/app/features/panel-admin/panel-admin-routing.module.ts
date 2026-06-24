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
import { AuthGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

const routes: Routes = [
	{
		path: '',
		component: PanelAdmin,
		canActivateChild: [AuthGuard],
		children: [
			{ path: '', redirectTo: 'profile', pathMatch: 'full' },
			{
				path: 'control-panel', component: ControlPanelComponent,
				canActivate: [roleGuard],
				data: { roles: ['ADMIN', 'GUIDE'] }
			},
			{
				path: 'packages', component: PackagesComponent,
				canActivate: [roleGuard],
				data: { roles: ['ADMIN', 'GUIDE'] }
			},
			{
				path: 'packages-providers', component: ProveedorComponent,
				canActivate: [roleGuard],
				data: { roles: ['ADMIN', 'GUIDE'] }
			},
			{
				path: 'reservations', component: ReservationsComponent,
				canActivate: [roleGuard],
				data: { roles: ['ADMIN', 'GUIDE'] }
			},
			{
				path: 'users-roles', component: UsersRolesComponent,
				canActivate: [roleGuard],
				data: { roles: ['ADMIN', 'GUIDE'] }
			},
			{
				path: 'packages-comments', component: CommentsComponent,
				canActivate: [roleGuard],
				data: { roles: ['ADMIN', 'GUIDE'] }
			},
			{
				path: 'gallery-admin', component: GalleryAdminComponent,
				canActivate: [roleGuard],
				data: { roles: ['ADMIN', 'GUIDE'] }
			},
			{
				path: 'profile', component: ProfileComponent,
				canActivate: [roleGuard],
				data: { roles: ['ADMIN', 'GUIDE', 'CLIENT'] }
			},
			{
				path: 'packages-viajes', component: DashboardOperativoComponent,
				canActivate: [roleGuard],
				data: { roles: ['ADMIN', 'GUIDE'] }
			},
			{
				path: 'operaciones-transporte', component: AsignarTransporteComponent,
				canActivate: [roleGuard],
				data: { roles: ['ADMIN', 'GUIDE'] }
			},
			{
				path: 'operaciones-check-in', component: CheckInQrComponent,
				canActivate: [roleGuard],
				data: { roles: ['ADMIN', 'GUIDE'] }
			},
			{
				path: 'operaciones-alojamiento', component: AsignarAlojamientoComponent,
				canActivate: [roleGuard],
				data: { roles: ['ADMIN', 'GUIDE'] }
			},
			{
				path: 'operaciones-info-medica', component: InfoMedicaComponent,
				canActivate: [roleGuard],
				data: { roles: ['ADMIN', 'GUIDE'] }
			},
			{
				path: 'operaciones-comunicaciones', component: ComunicacionesComponent,
				canActivate: [roleGuard],
				data: { roles: ['ADMIN', 'GUIDE'] }
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class PanelAdminRoutingModule { }
