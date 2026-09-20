import { Component, input } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Venta } from '../../../../services/venta.service';

@Component({
  selector: 'app-ventas-tabla',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './venta-tabla.html',
  styleUrl: './venta-tabla.css'
})
export class VentasTabla {
  readonly ventas = input.required<Venta[]>();
  readonly cargando = input<boolean>(false);
}