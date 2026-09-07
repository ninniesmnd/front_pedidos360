import { Injectable, inject, signal, computed } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../enviroments/enviroment';
import { AppRole } from './roles';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly msal = inject(MsalService);

  private readonly _roles = signal<string[]>([]);
  readonly roles = this._roles.asReadonly();
  readonly isAuthenticated = computed(() => this.msal.instance.getActiveAccount() !== null);

  /** Se llama una vez tras el login (o en un APP_INITIALIZER) */
  async cargarRoles(): Promise<void> {
    const account = this.msal.instance.getActiveAccount();
    if (!account) { this._roles.set([]); return; }

    const result = await this.msal.instance.acquireTokenSilent({
      scopes: environment.msal.apiScopes,
      account
    });

    const claims: any = jwtDecode(result.accessToken);
    this._roles.set(claims.roles ?? []);
  }

  hasRole(role: AppRole): boolean {
    return this._roles().includes(role);
  }

  hasAnyRole(roles: AppRole[]): boolean {
    return roles.some(r => this._roles().includes(r));
  }

  dashboardPorRol(): string {
    if (this.hasRole(AppRole.AdminGeneral)) return '/dashboard/admin-general';
    if (this.hasRole(AppRole.AdminLocal)) return '/dashboard/admin-local';
    if (this.hasRole(AppRole.OperadorCocina)) return '/dashboard/cocina';
    if (this.hasRole(AppRole.Repartidor)) return '/dashboard/despacho';
    return '/dashboard/cliente';
  }

  logout(): void {
    this.msal.logoutRedirect();
  }
}