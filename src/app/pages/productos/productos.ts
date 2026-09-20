import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Card } from '../../shared/components/card/card';
import { ProductoService, Producto } from '../../services/producto.service';
import { PedidoService, ItemPedidoRequest } from '../../services/pedido.service';

@Component({
  selector: 'app-productos-pagina',
  imports: [Card, RouterLink, FormsModule],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class ProductosPagina implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly pedidoService = inject(PedidoService);

  protected readonly productos = signal<Producto[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly carritoItems = signal<ItemPedidoRequest[]>([]);
  protected readonly panelAbierto = signal(false);
  protected readonly enviando = signal(false);
  protected readonly errorPedido = signal<string | null>(null);
  protected readonly pedidoConfirmado = signal(false);

  protected localId = 1;
  protected tipoDespacho: 'DELIVERY' | 'RETIRO_EN_TIENDA' = 'DELIVERY';

  protected readonly totalItems = computed(() =>
    this.carritoItems().reduce((acc, i) => acc + i.cantidad, 0)
  );

  protected readonly totalCarrito = computed(() =>
    this.carritoItems().reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0)
  );

  ngOnInit(): void {
    this.cargando.set(true);
    this.productoService.listar().subscribe({
      next: (productos) => {
        this.productos.set(productos.filter(p => p.activo));
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar el catálogo en este momento.');
        this.cargando.set(false);
      }
    });
  }

  protected cantidadDe(productoId: number): number {
    return this.carritoItems().find(i => i.productoId === productoId)?.cantidad ?? 0;
  }

  protected agregarAlCarrito(producto: Producto): void {
    this.carritoItems.update(actual => {
      const existente = actual.find(i => i.productoId === producto.id);
      if (existente) {
        return actual.map(i =>
          i.productoId === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...actual, {
        productoId: producto.id,
        nombreProducto: producto.nombre,
        cantidad: 1,
        precioUnitario: producto.precio
      }];
    });
    this.pedidoConfirmado.set(false);
  }

  protected quitarItem(index: number): void {
    this.carritoItems.update(actual => actual.filter((_, i) => i !== index));
  }

  protected abrirPanel(): void {
    this.errorPedido.set(null);
    this.panelAbierto.set(true);
  }

  protected cerrarPanel(): void {
    this.panelAbierto.set(false);
  }

  protected confirmarPedido(): void {
    if (this.carritoItems().length === 0) {
      this.errorPedido.set('Agrega al menos un producto.');
      return;
    }
    this.enviando.set(true);
    this.errorPedido.set(null);

    this.pedidoService.crearPedido({
      localId: this.localId,
      tipoDespacho: this.tipoDespacho,
      items: this.carritoItems()
    }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.carritoItems.set([]);
        this.panelAbierto.set(false);
        this.pedidoConfirmado.set(true);
      },
      error: (err) => {
        this.enviando.set(false);
        this.errorPedido.set(`Error ${err.status}: no se pudo crear el pedido.`);
      }
    });
  }
}