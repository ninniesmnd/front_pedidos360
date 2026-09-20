import { Injectable, inject, signal } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../enviroments/enviroment';
import { AppRole } from './roles';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly msal = inject(MsalService);

  private readonly _roles = signal<string[]>([]);
  readonly roles = this._roles.asReadonly();

  // Ojo: MSAL no expone el estado de la cuenta activa como una signal ni un
  // observable propio, así que no hay forma confiable de derivar esto con
  // computed()/toSignal() — ambos terminan cacheando una lectura hecha antes
  // de que app.ts alcance a activar la cuenta (setActiveAccount corre en su
  // ngOnInit, después del constructor de este servicio). Por eso este es un
  // signal explícito: solo cambia cuando actualizarEstadoAutenticacion() se
  // llama a propósito, después de que sabemos que el estado pudo cambiar.
  private readonly _autenticado = signal(this.msal.instance.getActiveAccount() !== null);
  readonly isAuthenticated = this._autenticado.asReadonly();

  /**
   * Llamar cada vez que el estado de la cuenta activa de MSAL pudo haber
   * cambiado: tras handleRedirectObservable, tras el fallback de sesión ya
   * activa (SSO silencioso / recarga de página), y tras logout.
   */
  actualizarEstadoAutenticacion(): void {
    this._autenticado.set(this.msal.instance.getActiveAccount() !== null);
  }

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
    this._autenticado.set(false);
    this.msal.logoutRedirect();
  }
}