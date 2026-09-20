import { Component, input } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Pedido } from '../../../services/pedido.service';

@Component({
  selector: 'app-pedidos-tabla',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './pedidos-tabla.html',
  styleUrl: './pedidos-tabla.css'
})
export class PedidosTabla {
  readonly pedidos = input.required<Pedido[]>();
  readonly cargando = input<boolean>(false);

  protected totalPedido(pedido: Pedido): number {
    return pedido.items.reduce((total, item) => total + item.precioUnitario * item.cantidad, 0);
  }

  protected cantidadItems(pedido: Pedido): number {
    return pedido.items.reduce((total, item) => total + item.cantidad, 0);
  }

  protected claseEstado(estado: string): string {
    const normalizado = estado.toLowerCase();
    if (normalizado.includes('pendiente')) return 'estado--pendiente';
    if (normalizado.includes('listo') || normalizado.includes('complet') || normalizado.includes('entreg')) return 'estado--listo';
    if (normalizado.includes('cancel') || normalizado.includes('rechaz')) return 'estado--alerta';
    return 'estado--neutro';
  }
}