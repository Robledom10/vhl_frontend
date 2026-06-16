import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('AuthInterceptor', () => {
	let httpClient: HttpClient;
	let httpTestingController: HttpTestingController;
	let authServiceSpy: jasmine.SpyObj<AuthService>;

	beforeEach(() => {
		// Creamos un clon falso (spy) del servicio de autenticación para no alterar la base de datos real
		const spy = jasmine.createSpyObj('AuthService', ['getToken', 'refreshToken', 'clearSession']);

		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [
				// Registramos tu interceptor de clases exactamente como se hace en el AppModule
				{
					provide: HTTP_INTERCEPTORS,
					useClass: AuthInterceptor,
					multi: true
				},
				// Inyectamos el servicio falso en lugar del real
				{ provide: AuthService, useValue: spy }
			]
		});

		// Conectamos las herramientas de pruebas de Angular
		httpClient = TestBed.inject(HttpClient);
		httpTestingController = TestBed.inject(HttpTestingController);
		authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
	});

	afterEach(() => {
		// Verifica que no quede ninguna petición colgada o sin responder al terminar cada prueba
		httpTestingController.verify();
	});

	it('debería crearse correctamente el interceptor', () => {
		// Intentamos resolver los interceptores configurados
		const interceptors = TestBed.inject(HTTP_INTERCEPTORS);
		const hasAuthInterceptor = interceptors.some(interceptor => interceptor instanceof AuthInterceptor);

		expect(hasAuthInterceptor).toBeTrue();
	});
});