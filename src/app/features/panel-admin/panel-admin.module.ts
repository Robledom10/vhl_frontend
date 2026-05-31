import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { PanelAdminRoutingModule } from './panel-admin-routing.module';
import { PanelAdmin } from './panel-admin';
import { NavbarPanelAdminComponent } from './components/navbar-panel-admin/navbar-panel-admin.component';
import { ControlPanelComponent } from './pages/control-panel/control-panel.component';
import { PackagesComponent } from './pages/packages/packages.component';
import { ReservationsComponent } from './pages/reservations/reservations.component';
import { UsersRolesComponent } from './pages/users-roles/users-roles.component';
import { CommentsComponent } from './pages/comments/comments.component';
import { MessagesComponent } from './pages/messages/messages.component';
import { OffersComponent } from './pages/offers/offers.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { ToastNotificationComponent } from './components/toast-notification/toast-notification.component';
import { EditUserRoleModalComponent } from './pages/users-roles/components/edit-user-role-modal/edit-user-role-modal.component';
import { ViewUserModalComponent } from './pages/users-roles/components/view-user-modal/view-user-modal.component';
import { CreateUserModalComponent } from './pages/users-roles/components/create-user-modal/create-user-modal.component';
import { ProveedorComponent } from './pages/packages/pages/proveedor/proveedor.component';
import { PricingPlanComponent } from './pages/packages/pages/pricing-plan/pricing-plan.component';
import { SegurosComponent } from './pages/packages/pages/seguros/seguros.component';
import { OrganizationProfileComponent } from './pages/packages/pages/organization-profile/organization-profile.component';
import { FormPackageCreationComponent } from './pages/packages/components/form-package-creation/form-package-creation.component';
import { MediaUploadModalComponent } from './pages/gallery-admin/components/media-upload-modal/media-upload-modal.component';
import { GalleryAdminComponent } from './pages/gallery-admin/gallery-admin.component';

@NgModule({
	declarations: [
		PanelAdmin,
		NavbarPanelAdminComponent,
		ControlPanelComponent,
		PackagesComponent,
		ReservationsComponent,
		UsersRolesComponent,
		CommentsComponent,
		MessagesComponent,
		OffersComponent,
		ProfileComponent,
		ConfirmModalComponent,
		ToastNotificationComponent,
		EditUserRoleModalComponent,
		ViewUserModalComponent,
		CreateUserModalComponent,
		ProveedorComponent,
		PricingPlanComponent,
		SegurosComponent,
		OrganizationProfileComponent,
		FormPackageCreationComponent,
		MediaUploadModalComponent,
		GalleryAdminComponent,
	],
	imports: [
		CommonModule,
		PanelAdminRoutingModule,
		SharedModule,
		RouterModule,
		ReactiveFormsModule,
		FormsModule,
	],
})
export class PanelAdminModule { }
