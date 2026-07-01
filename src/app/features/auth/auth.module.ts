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
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ForgotPasswordFormComponent } from './pages/forgot-password/components/forgot-password-form/forgot-password-form.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { ResetPasswordFormComponent } from './pages/reset-password/components/reset-password-form/reset-password-form.component';

@NgModule({

	declarations: [
		LoginComponent,
		RegisterComponent,
		LoginFormComponent,
		RegisterFormComponent,
		AuthBannerComponent,
		LoginTypesComponent,
		ForgotPasswordComponent,
		ForgotPasswordFormComponent,
		ResetPasswordComponent,
		ResetPasswordFormComponent
	],

	imports: [
		CommonModule,
		AuthRoutingModule,
		ReactiveFormsModule,
		SharedModule
	]
})
export class AuthModule { }