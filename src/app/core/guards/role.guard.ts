import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot): boolean | UrlTree => {

	const authService = inject(AuthService);
	const router = inject(Router);

	// Usuario autenticado
	const user = authService.getUser();

	// Si no hay usuario, redirigir al login
	if (!user) {
		return router.createUrlTree(['/auth/login']);
	}

	// Obtener los roles permitidos para la ruta
	const allowedRoles: string[] = route.data['roles'] ?? [];

	// Si la ruta no tiene roles definidos, permitir el acceso
	if (allowedRoles.length === 0) {
		return true;
	}

	// Validar si el usuario tiene un rol permitido
	if (!allowedRoles.includes(user.role)) {
		// Puedes redirigir al home o a una página de acceso denegado
		return router.createUrlTree(['/']);
	}

	return true;
};