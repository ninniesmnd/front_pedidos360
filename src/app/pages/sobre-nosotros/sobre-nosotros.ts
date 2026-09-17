import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-sobre-nosotros-pagina',
  imports: [RouterLink],
  templateUrl: './sobre-nosotros.html',
  styleUrl: './sobre-nosotros.css'
})
export class SobreNosotrosPagina {
  private readonly msalService = inject(MsalService);
  private readonly msalBroadcastService = inject(MsalBroadcastService);

  protected readonly estaAutenticado = toSignal(
    this.msalBroadcastService.inProgress$.pipe(
      filter((estado) => estado === InteractionStatus.None),
      map(() => this.msalService.instance.getAllAccounts().length > 0)
    ),
    { initialValue: this.msalService.instance.getAllAccounts().length > 0 }
  );
}