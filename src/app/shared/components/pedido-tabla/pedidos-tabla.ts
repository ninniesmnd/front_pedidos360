import { Component, computed, inject, input, output } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { EstadoPedido, Pedido } from '../../../services/pedido.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AppRole } from '../../../core/auth/roles';
import { SinGuionesPipe } from '../../pipes/sin-guiones.pipe';

export interface AccionPedido {
  etiqueta: string;
  nuevoEstado: EstadoPedido;
  peligrosa?: boolean;
}

export interface CambioEstado {
  pedido: Pedido;
  nuevoEstado: EstadoPedido;
}

@Component({
  selector: 'app-pedidos-tabla',
  imports: [DatePipe, DecimalPipe, SinGuionesPipe],
  templateUrl: './pedidos-tabla.html',
  styleUrl: './pedidos-tabla.css'
})
export class PedidosTabla {
  private readonly auth = inject(AuthService);

  readonly pedidos = input.required<Pedido[]>();
  readonly cargando = input<boolean>(false);
  readonly actualizandoId = input<number | null>(null);

  readonly cambiarEstado = output<CambioEstado>();

  // La columna de acciones solo aparece para roles que operan pedidos.
  protected readonly puedeActuar = computed(() =>
    this.auth.hasAnyRole([AppRole.OperadorCocina, AppRole.Repartidor, AppRole.AdminLocal])
  );

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

  /** Acciones permitidas según el rol del usuario y el estado actual del pedido. */
  protected accionesDe(pedido: Pedido): AccionPedido[] {
    const esAdmin = this.auth.hasRole(AppRole.AdminLocal);
    const esCocina = this.auth.hasRole(AppRole.OperadorCocina);
    const esRepartidor = this.auth.hasRole(AppRole.Repartidor);
    const acciones: AccionPedido[] = [];

    switch (pedido.estado) {
      case 'RECIBIDO':
        if (esCocina || esAdmin) {
          acciones.push({ etiqueta: 'Preparar', nuevoEstado: 'EN_PREPARACION' });
        }
        break;
      case 'EN_PREPARACION':
        if (esCocina || esAdmin) {
          acciones.push({ etiqueta: 'Marcar listo', nuevoEstado: 'LISTO_PARA_DESPACHO' });
        }
        break;
      case 'LISTO_PARA_DESPACHO':
        if (pedido.tipoDespacho === 'DELIVERY') {
          if (esRepartidor || esAdmin) {
            acciones.push({ etiqueta: 'Salir a reparto', nuevoEstado: 'EN_REPARTO' });
          }
        } else if (esAdmin) {
          acciones.push({ etiqueta: 'Entregar en tienda', nuevoEstado: 'ENTREGADO' });
        }
        break;
      case 'EN_REPARTO':
        if (esRepartidor || esAdmin) {
          acciones.push({ etiqueta: 'Marcar entregado', nuevoEstado: 'ENTREGADO' });
        }
        break;
    }

    if (esAdmin && (pedido.estado === 'RECIBIDO' || pedido.estado === 'EN_PREPARACION')) {
      acciones.push({ etiqueta: 'Cancelar', nuevoEstado: 'CANCELADO', peligrosa: true });
    }

    return acciones;
  }

  protected ejecutar(pedido: Pedido, accion: AccionPedido): void {
    this.cambiarEstado.emit({ pedido, nuevoEstado: accion.nuevoEstado });
  }
}