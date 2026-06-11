import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { GoogleService } from './core/services/google.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrl: './app.component.css'
})
export class AppComponent {

	constructor(
		private googleService: GoogleService,
		private authService: AuthService,
		private router: Router
	) { }

	ngOnInit(): void {

		this.googleService.init(
			(credential: string) => {
				this.authService
					.googleLogin(credential)
					.subscribe({
						next: () => {
							this.router.navigate(
								['/home']
							);
						},
						error: (err) => {
							console.error(
								'Google Login Error',
								err
							);
						}
					});
			}
		);
	}

	get showChatbot(): boolean {
		return !this.router.url.includes('panel-admin');
	}
}