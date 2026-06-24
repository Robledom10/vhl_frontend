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
import { CommentsComponent } from './pages/packages/pages/comments/comments.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { ToastNotificationComponent } from './components/toast-notification/toast-notification.component';
import { EditUserRoleModalComponent } from './pages/users-roles/components/edit-user-role-modal/edit-user-role-modal.component';
import { ViewUserModalComponent } from './pages/users-roles/components/view-user-modal/view-user-modal.component';
import { CreateUserModalComponent } from './pages/users-roles/components/create-user-modal/create-user-modal.component';
import { ProveedorComponent } from './pages/packages/pages/proveedor/proveedor.component';
import { FormPackageCreationComponent } from './pages/packages/components/form-package-creation/form-package-creation.component';
import { MediaUploadModalComponent } from './pages/gallery-admin/components/media-upload-modal/media-upload-modal.component';
import { GalleryAdminComponent } from './pages/gallery-admin/gallery-admin.component';
import { FormProviderComponent } from './pages/packages/pages/proveedor/components/form-provider/form-provider.component';
import { FormReservationsCreationComponent } from './pages/reservations/components/form-reservations-creation/form-reservations-creation.component';
import { ReservationDetailSheetComponent } from './pages/reservations/components/reservation-detail-sheet/reservation-detail-sheet.component';
import { DashboardOperativoComponent } from './pages/operation/pages/operations-dashboard/operations-dashboard.component';
import { AsignarTransporteComponent } from './pages/operation/pages/assign-transport/assign-transport.component';
import { CheckInQrComponent } from './pages/operation/pages/check-in-qr/check-in-qr.component';
import { AsignarAlojamientoComponent } from './pages/operation/pages/assign-accommodation/assign-accommodation.component';
import { InfoMedicaComponent } from './pages/operation/pages/medical-info/medical-info.component';
import { ComunicacionesComponent } from './pages/operation/pages/communications/communications.component';
import { UploadDocumentModalComponent } from './pages/profile/components/upload-document-modal/upload-document-modal.component';
import { DocumentViewerComponent } from './pages/reservations/components/document-viewer/document-viewer.component';
import { FormAssignAccommodationComponent } from './pages/operation/pages/assign-accommodation/components/form-assign-accommodation/form-assign-accommodation.component';
import { DetailAccommodationComponent } from './pages/operation/pages/assign-accommodation/components/detail-accommodation/detail-accommodation.component';
import { FormAssignTransportComponent } from './pages/operation/pages/assign-transport/components/form-assign-transport/form-assign-transport.component';
import { DetailTransportComponent } from './pages/operation/pages/assign-transport/components/detail-transport/detail-transport.component';
import { FormEmergencyContactComponent } from './pages/operation/pages/emergency-contacts/components/form-emergency-contact/form-emergency-contact.component';
import { FormMedicalInfoComponent } from './pages/operation/pages/medical-info/components/form-medical-info/form-medical-info.component';
import { FormCommunicationComponent } from './pages/operation/pages/communications/components/form-communication/form-communication.component';
import { NgApexchartsModule } from 'ng-apexcharts';

@NgModule({
	declarations: [
		PanelAdmin,
		NavbarPanelAdminComponent,
		ControlPanelComponent,
		PackagesComponent,
		ReservationsComponent,
		UsersRolesComponent,
		CommentsComponent,
		ProfileComponent,
		ConfirmModalComponent,
		ToastNotificationComponent,
		EditUserRoleModalComponent,
		ViewUserModalComponent,
		CreateUserModalComponent,
		ProveedorComponent,
		FormPackageCreationComponent,
		MediaUploadModalComponent,
		GalleryAdminComponent,
		FormProviderComponent,
		FormReservationsCreationComponent,
		ReservationDetailSheetComponent,
		DashboardOperativoComponent,
		AsignarTransporteComponent,
		CheckInQrComponent,
		AsignarAlojamientoComponent,
		InfoMedicaComponent,
		ComunicacionesComponent,
		UploadDocumentModalComponent,
		DocumentViewerComponent,
		FormAssignAccommodationComponent,
		DetailAccommodationComponent,
		FormAssignTransportComponent,
		DetailTransportComponent,
		FormEmergencyContactComponent,
		FormMedicalInfoComponent,
		FormCommunicationComponent,
	],
	imports: [
		CommonModule,
		PanelAdminRoutingModule,
		SharedModule,
		RouterModule,
		ReactiveFormsModule,
		FormsModule,
		NgApexchartsModule,
	],
})
export class PanelAdminModule { }
