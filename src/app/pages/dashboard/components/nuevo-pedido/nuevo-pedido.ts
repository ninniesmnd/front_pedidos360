import { Component, EventEmitter, Output, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PedidoService, ItemPedidoRequest } from '../../../../services/pedido.service';
import { ProductoService, Producto } from '../../../../services/producto.service';

@Component({
  selector: 'app-nuevo-pedido',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './nuevo-pedido.html',
  styleUrl: './nuevo-pedido.css'
})
export class NuevoPedido implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  private readonly productoService = inject(ProductoService);

  @Output() creado = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();

  protected readonly productos = signal<Producto[]>([]);
  protected readonly items = signal<ItemPedidoRequest[]>([]);
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected localId = 1;
  protected tipoDespacho: 'DELIVERY' | 'RETIRO_EN_TIENDA' = 'DELIVERY';
  protected productoSeleccionadoId: number | null = null;
  protected cantidadSeleccionada = 1;

  ngOnInit(): void {
    this.productoService.listar().subscribe({
      next: (data) => this.productos.set(data.filter(p => p.activo)),
      error: () => this.error.set('No se pudieron cargar los productos.')
    });
  }

  protected agregarItem(): void {
    if (this.productoSeleccionadoId == null || this.cantidadSeleccionada < 1) return;
    const producto = this.productos().find(p => p.id === this.productoSeleccionadoId);
    if (!producto) return;

    this.items.update(actual => [...actual, {
      productoId: producto.id,
      nombreProducto: producto.nombre,
      cantidad: this.cantidadSeleccionada,
      precioUnitario: producto.precio
    }]);

    this.productoSeleccionadoId = null;
    this.cantidadSeleccionada = 1;
  }

  protected quitarItem(index: number): void {
    this.items.update(actual => actual.filter((_, i) => i !== index));
  }

  protected total(): number {
    return this.items().reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0);
  }

  protected confirmar(): void {
    if (this.items().length === 0) {
      this.error.set('Agrega al menos un producto.');
      return;
    }
    this.enviando.set(true);
    this.error.set(null);

    this.pedidoService.crearPedido({
      localId: this.localId,
      tipoDespacho: this.tipoDespacho,
      items: this.items()
    }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.creado.emit();
      },
      error: (err) => {
        this.enviando.set(false);
        this.error.set(`Error ${err.status}: no se pudo crear el pedido.`);
      }
    });
  }
}