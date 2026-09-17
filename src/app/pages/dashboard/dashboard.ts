import { Component, inject, signal, computed, OnInit } from '@angular/core';
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
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly busqueda = signal('');
  protected readonly estadoSeleccionado = signal('todos');
  protected readonly paginaActual = signal(1);
  protected readonly porPagina = 10;

  /** Reactivo: se recalcula cuando AuthService.cargarRoles() actualiza los roles. */
  protected readonly esAdminGeneral = computed(() =>
    this.auth.hasRole(AppRole.AdminGeneral)
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
    // AdminGeneral solo ve el resumen (placeholder); no se piden ni muestran pedidos.
    if (!this.esAdminGeneral()) {
      this.cargarPedidos();
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