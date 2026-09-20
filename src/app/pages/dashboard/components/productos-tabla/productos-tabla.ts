import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Producto } from '../../../../services/producto.service';

@Component({
  selector: 'app-productos-tabla',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './productos-tabla.html',
  styleUrl: './productos-tabla.css'
})
export class ProductosTabla {
  readonly productos = input.required<Producto[]>();
  readonly cargando = input<boolean>(false);
}