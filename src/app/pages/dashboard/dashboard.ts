import { Component, inject, signal, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { filter, map } from 'rxjs';
import { PedidoService, Pedido } from '../../services/pedido.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private readonly msalService = inject(MsalService);
  private readonly msalBroadcastService = inject(MsalBroadcastService);
  private readonly pedidoService = inject(PedidoService);

  protected readonly nombreUsuario = toSignal(
    this.msalBroadcastService.inProgress$.pipe(
      filter((estado) => estado === InteractionStatus.None),
      map(() => {
        const cuenta = this.msalService.instance.getActiveAccount()
          ?? this.msalService.instance.getAllAccounts()[0];
        return cuenta?.name ?? cuenta?.username ?? 'Usuario';
      })
    ),
    { initialValue: 'Usuario' }
  );

  protected readonly pedidos = signal<Pedido[]>([]);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.pedidoService.misPedidos().subscribe({
      next: (data) => this.pedidos.set(data),
      error: (err) => this.error.set(`Error ${err.status}: ${err.message}`)
    });
  }
}