import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { PedidoService, Pedido } from '../../services/pedido.service';
import { VentaService, Venta } from '../../services/venta.service';
import { ProductoService, Producto } from '../../services/producto.service';
import { AuthService } from '../../core/auth/auth.service';
import { AppRole } from '../../core/auth/roles';
import { PedidosTabla } from '../../shared/components/pedido-tabla/pedidos-tabla';
import { NuevoPedido } from './components/nuevo-pedido/nuevo-pedido';
import { VentasTabla } from './components/venta-tabla/venta-tabla';
import { ProductosTabla } from './components/productos-tabla/productos-tabla';
import { NuevoProducto } from './components/nuevo-producto/nuevo-producto';

@Component({
  selector: 'app-dashboard',
  imports: [PedidosTabla, NuevoPedido, VentasTabla, ProductosTabla, NuevoProducto],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  private readonly ventaService = inject(VentaService);
  private readonly productoService = inject(ProductoService);
  private readonly auth = inject(AuthService);

  protected readonly pedidos = signal<Pedido[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly busqueda = signal('');
  protected readonly estadoSeleccionado = signal('todos');
  protected readonly paginaActual = signal(1);
  protected readonly porPagina = 10;

  protected readonly mostrandoFormulario = signal(false);
  protected readonly ventas = signal<Venta[]>([]);
  protected readonly cargandoVentas = signal(false);

  protected readonly productos = signal<Producto[]>([]);
  protected readonly cargandoProductos = signal(false);
  protected readonly mostrandoFormularioProducto = signal(false);

  protected readonly esAdminGeneral = computed(() =>
    this.auth.hasRole(AppRole.AdminGeneral)
  );

  protected readonly esCliente = computed(() =>
    this.auth.hasRole(AppRole.Cliente)
  );

  protected readonly esAdmin = computed(() =>
    this.auth.hasAnyRole([AppRole.AdminLocal, AppRole.AdminGeneral])
  );

  protected readonly estadosDisponibles = computed(() => {
    const estados = new Set(this.pedidos().map(p => p.estado));
    return ['todos', ...Array.from(estados)];
  });

  protected readonly pedidosFiltrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const estado = this.estadoSeleccionado();

    return this.pedidos().filter(p => {
      const coincideEstado = estado === 'todos' || p.estado === estado;
      const coincideTexto = !texto ||
        String(p.id).includes(texto) ||
        p.clienteEmail.toLowerCase().includes(texto);
      return coincideEstado && coincideTexto;
    });
  });

  protected readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.pedidosFiltrados().length / this.porPagina))
  );

  protected readonly paginasVisibles = computed(() =>
    Array.from({ length: this.totalPaginas() }, (_, i) => i + 1)
  );

  protected readonly pedidosPagina = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.porPagina;
    return this.pedidosFiltrados().slice(inicio, inicio + this.porPagina);
  });

  ngOnInit(): void {
    if (!this.esAdminGeneral()) {
      this.cargarPedidos();
    }

    if (this.esAdmin()) {
      this.cargarVentas();
      this.cargarProductosAdmin();
    }
  }

  protected cargarPedidos(): void {
    this.cargando.set(true);
    this.error.set(null);

    const consulta$ = this.auth.hasRole(AppRole.OperadorCocina) ? this.pedidoService.pedidosCocina()
      : this.auth.hasRole(AppRole.Repartidor)                    ? this.pedidoService.pedidosDespacho()
      : this.auth.hasAnyRole([AppRole.AdminLocal, AppRole.AdminGeneral]) ? this.pedidoService.pedidosAdmin()
      : this.pedidoService.misPedidos();

    consulta$.subscribe({
      next: (data) => {
        this.pedidos.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(`Error ${err.status}: ${err.message}`);
        this.cargando.set(false);
      }
    });
  }

  private cargarVentas(): void {
    this.cargandoVentas.set(true);
    this.ventaService.listar().subscribe({
      next: (data) => {
        this.ventas.set(data);
        this.cargandoVentas.set(false);
      },
      error: () => this.cargandoVentas.set(false)
    });
  }

  protected cargarProductosAdmin(): void {
    this.cargandoProductos.set(true);
    this.productoService.listar().subscribe({
      next: (data) => {
        this.productos.set(data);
        this.cargandoProductos.set(false);
      },
      error: () => this.cargandoProductos.set(false)
    });
  }

  protected abrirNuevoPedido(): void {
    this.mostrandoFormulario.set(true);
  }

  protected cerrarNuevoPedido(): void {
    this.mostrandoFormulario.set(false);
  }

  protected onPedidoCreado(): void {
    this.mostrandoFormulario.set(false);
    this.cargarPedidos();
  }

  protected abrirNuevoProducto(): void {
    this.mostrandoFormularioProducto.set(true);
  }

  protected cerrarNuevoProducto(): void {
    this.mostrandoFormularioProducto.set(false);
  }

  protected onProductoCreado(): void {
    this.mostrandoFormularioProducto.set(false);
    this.cargarProductosAdmin();
  }

  protected actualizarBusqueda(valor: string): void {
    this.busqueda.set(valor);
    this.paginaActual.set(1);
  }

  protected actualizarEstado(valor: string): void {
    this.estadoSeleccionado.set(valor);
    this.paginaActual.set(1);
  }

  protected irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas()) return;
    this.paginaActual.set(pagina);
  }
}