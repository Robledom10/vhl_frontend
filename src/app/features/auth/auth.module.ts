import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AppAuthBannerComponent } from './components/app-auth-banner/app-auth-banner.component';
import { LoginFormComponent } from './pages/login/components/login-form/login-form.component';
import { RegisterFormComponent } from './pages/register/components/register-form/register-form.component';


@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    LoginFormComponent,
    RegisterFormComponent,
    AppAuthBannerComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule
  ]
})
export class AuthModule { }
