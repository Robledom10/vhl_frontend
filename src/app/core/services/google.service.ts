import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

declare const google: any;

@Injectable({
	providedIn: 'root'
})
export class GoogleService {
	private initialized = false;
	private callback!: (credential: string) => void;

	init(callback: (credential: string) => void) {
		this.callback = callback;
		if (this.initialized) {
			return;
		}

		this.initialized = true;

		google.accounts.id.initialize({
			client_id: environment.googleClientId,
			callback: (response: any) => {
				if (response?.credential) {
					this.callback(
						response.credential
					);

				}
			},

			auto_select: false,
			cancel_on_tap_outside: true,
			use_fedcm_for_prompt: true
		});
	}

	loginPopup() {
		google.accounts.id.prompt();
	}
}