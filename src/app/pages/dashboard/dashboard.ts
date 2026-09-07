import { Component, inject, signal, OnInit } from '@angular/core';
import { PedidoService, Pedido } from '../../services/pedido.service';
import { AuthService } from '../../core/auth/auth.service';
import { AppRole } from '../../core/auth/roles';
import { PedidosTabla } from '../../shared/components/pedido-tabla/pedidos-tabla';

@Component({
  selector: 'app-dashboard',
  imports: [PedidosTabla],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  private readonly auth = inject(AuthService);

  protected readonly pedidos = signal<Pedido[]>([]);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const consulta$ = this.auth.hasRole(AppRole.OperadorCocina) ? this.pedidoService.pedidosCocina()
      : this.auth.hasRole(AppRole.Repartidor)                    ? this.pedidoService.pedidosDespacho()
      : this.auth.hasAnyRole([AppRole.AdminLocal, AppRole.AdminGeneral]) ? this.pedidoService.pedidosAdmin()
      : this.pedidoService.misPedidos();

    consulta$.subscribe({
      next: (data) => this.pedidos.set(data),
      error: (err) => this.error.set(`Error ${err.status}: ${err.message}`)
    });
  }
}