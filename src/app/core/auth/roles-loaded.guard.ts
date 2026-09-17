import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Garantiza que los roles del usuario estén cargados antes de activar la ruta.
 * Al ser async, Angular espera esta promesa antes de instanciar el componente,
 * eliminando la carrera entre cargarRoles() y el ngOnInit del componente.
 */
export const rolesLoadedGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  await auth.cargarRoles();
  return true;
};