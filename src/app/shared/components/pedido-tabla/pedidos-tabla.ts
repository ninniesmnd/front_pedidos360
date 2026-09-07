import { Component, input } from '@angular/core';
import { Pedido } from '../../../services/pedido.service';

@Component({
  selector: 'app-pedidos-tabla',
  imports: [],
  templateUrl: './pedidos-tabla.html',
  styleUrl: './pedidos-tabla.css'
})
export class PedidosTabla {
  pedidos = input.required<Pedido[]>();
}