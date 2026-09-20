import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { Navbar } from './core/layout/navbar/navbar';
import { Footer } from './core/layout/footer/footer';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly msalService = inject(MsalService);
  private readonly auth = inject(AuthService);

  ngOnInit(): void {
    this.msalService.handleRedirectObservable().subscribe({
      next: (result) => {
        // MSAL no activa la cuenta automáticamente: hay que setearla nosotros
        // con el resultado del redirect, o getActiveAccount() sigue devolviendo null
        // y cargarRoles() deja los roles vacíos aunque el login haya sido exitoso.
        if (result?.account) {
          this.msalService.instance.setActiveAccount(result.account);
        }

        this.auth.actualizarEstadoAutenticacion();

        if (this.msalService.instance.getActiveAccount()) {
          this.auth.cargarRoles();
        }
      }
    });

    // Cubre el caso de sesión ya activa (SSO silencioso / recarga de página),
    // donde handleRedirectObservable no emite nada nuevo.
    if (!this.msalService.instance.getActiveAccount()) {
      const cuentas = this.msalService.instance.getAllAccounts();
      if (cuentas.length > 0) {
        this.msalService.instance.setActiveAccount(cuentas[0]);
      }
    }

    this.auth.actualizarEstadoAutenticacion();

    if (this.msalService.instance.getActiveAccount()) {
      this.auth.cargarRoles();
    }
  }
}