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

		if (this.initialized) return;
		this.initialized = true;

		google.accounts.id.initialize({
			client_id: environment.googleClientId,
			callback: (response: any) => {
				if (response.credential) {
					this.callback(response.credential); // 👉 ID TOKEN JWT
				}
			},
			auto_select: false,
			use_fedcm_for_prompt: true // ✅ IMPORTANTE (FedCM)
		});
	}

	// 🔥 POPUP MÁS CONTROLADO (no depende del One Tap pequeño)
	loginPopup() {
		google.accounts.id.prompt();
	}

	// 🔥 OPCIONAL: OAuth code flow (más control, recomendado futuro)
	loginWithPopupLarge() {
		const client = google.accounts.oauth2.initTokenClient({
			client_id: environment.googleClientId,
			scope: 'openid email profile',
			callback: (response: any) => {
				console.log('Access Token:', response.access_token);
			}
		});

		client.requestAccessToken();
	}
}