import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  private readonly msalService = inject(MsalService);
  private readonly msalBroadcastService = inject(MsalBroadcastService);

  protected readonly menuAbierto = signal(false);

  protected readonly estaAutenticado = toSignal(
    this.msalBroadcastService.inProgress$.pipe(
      filter((estado) => estado === InteractionStatus.None),
      map(() => this.msalService.instance.getAllAccounts().length > 0)
    ),
    { initialValue: this.msalService.instance.getAllAccounts().length > 0 }
  );

  protected alternarMenu(): void {
    this.menuAbierto.update(valor => !valor);
  }

  protected cerrarSesion(): void {
    this.msalService.logoutRedirect({
      postLogoutRedirectUri: '/'
    });
  }
}