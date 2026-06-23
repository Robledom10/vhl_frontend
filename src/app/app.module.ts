import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ChatbotWidgetComponent } from './shared/chatbot-widget/chatbot-widget.component';
import { SharedModule } from './shared/shared.module';
import { PaymentComponentComponent } from './features/payments/components/payment.component';

@NgModule({
	declarations: [
		AppComponent,
		ChatbotWidgetComponent,
		PaymentComponentComponent,
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		AppRoutingModule,
		HttpClientModule,
		FormsModule,
		SharedModule,
	],
	providers: [
		{
			provide: HTTP_INTERCEPTORS,
			useClass: AuthInterceptor,
			multi: true,
		},
		provideAnimationsAsync()
	],
	bootstrap: [AppComponent]
})
export class AppModule { }