import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot): boolean | UrlTree => {

	const authService = inject(AuthService);
	const router = inject(Router);

	// Usuario actual
	const user = authService.getUser();

	// Roles permitidos
	const allowedRoles = route.data['roles'] as string[];

	// No logueado
	if (!user) {
		return router.createUrlTree(['/auth/login']);
	}

	// Rol no permitido
	if (!allowedRoles.includes(user.role)) {
		return router.createUrlTree(['/']);
	}

	// Acceso permitido
	return true;
};