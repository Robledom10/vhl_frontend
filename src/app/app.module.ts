import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthBannerComponent } from './ruta/auth-banner/auth-banner.component';

@NgModule({
  declarations: [
    AuthBannerComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    AuthBannerComponent   // 👈 ESTO ES CLAVE
  ]
})
export class AuthModule { }
