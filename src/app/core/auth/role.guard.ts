import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AppRole } from './roles';

export function roleGuard(rolesPermitidos: AppRole[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    return auth.hasAnyRole(rolesPermitidos) ? true : router.parseUrl('/dashboard');
  };
}