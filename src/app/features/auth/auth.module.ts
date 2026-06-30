import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AuthBannerComponent } from './components/auth-banner/auth-banner.component';
import { LoginFormComponent } from './pages/login/components/login-form/login-form.component';
import { RegisterFormComponent } from './pages/register/components/register-form/register-form.component';
import { LoginTypesComponent } from './components/login-types/login-types.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

@NgModule({

	declarations: [
		LoginComponent,
		RegisterComponent,
		LoginFormComponent,
		RegisterFormComponent,
		AuthBannerComponent,
		LoginTypesComponent
	],

	imports: [
		CommonModule,
		AuthRoutingModule,
		ReactiveFormsModule,
		SharedModule
	]
})
export class AuthModule { }