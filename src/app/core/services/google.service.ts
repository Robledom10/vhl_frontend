import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

declare const google: any;

@Injectable({
	providedIn: 'root'
})
export class GoogleService {

	private initialized = false;
	private credentialCallback?: (credential: string) => void;

	initGoogle(callback: (credential: string) => void) {

		this.credentialCallback = callback;

		if (typeof google === 'undefined') {
			console.error('Google Identity Services no ha cargado');
			return;
		}

		if (this.initialized) {
			return;
		}

		google.accounts.id.initialize({
			client_id: environment.googleClientId,
			callback: (response: any) => {
				this.credentialCallback?.(response.credential);
			}
		});

		this.initialized = true;
	}

	prompt() {
		google.accounts.id.prompt();
	}
}