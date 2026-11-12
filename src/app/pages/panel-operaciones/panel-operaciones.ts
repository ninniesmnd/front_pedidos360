import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, catchError, forkJoin, of } from 'rxjs';
import { PedidoService, Pedido } from '../../services/pedido.service';
import { VentaService, Venta } from '../../services/venta.service';
import { ProductoService, Producto } from '../../services/producto.service';
import { StreamingService, ResultadoStreaming } from '../../services/streaming.service';
import { AuthService } from '../../core/auth/auth.service';
import { AppRole } from '../../core/auth/roles';
import { SinGuionesPipe } from '../../shared/pipes/sin-guiones.pipe';

type Periodo = 'hoy' | 'semana' | 'todo';

const UMBRAL_STOCK_BAJO = 5; // app.inventario.umbral-stock-bajo en ventas
const REFRESCO_MS = 15000;
const ESTADOS_ORDEN = [
  'RECIBIDO', 'EN_PREPARACION', 'LISTO_PARA_DESPACHO', 'EN_REPARTO', 'ENTREGADO', 'CANCELADO'
];
const ESTADOS_ACTIVOS = ['RECIBIDO', 'EN_PREPARACION', 'LISTO_PARA_DESPACHO', 'EN_REPARTO'];

interface Barra { etiqueta: string; valor: number; pct: number; }

@Component({
  selector: 'app-panel-operaciones',
  imports: [DatePipe, DecimalPipe, SinGuionesPipe],
  templateUrl: './panel-operaciones.html',
  styleUrl: './panel-operaciones.css'
})
export class PanelOperaciones implements OnInit {
  private readonly pedidoService = inject(PedidoService);
  private readonly ventaService = inject(VentaService);
  private readonly productoService = inject(ProductoService);
  private readonly streamingService = inject(StreamingService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // --- Datos crudos ---
  protected readonly pedidos = signal<Pedido[]>([]);
  protected readonly ventas = signal<Venta[]>([]);
  protected readonly productos = signal<Producto[]>([]);
  protected readonly eventos = signal<ResultadoStreaming[]>([]);

  // --- Estado de UI ---
  protected readonly cargando = signal(false);
  protected readonly errores = signal<string[]>([]);
  protected readonly ultimaActualizacion = signal<Date | null>(null);
  protected readonly autoRefresh = signal(true);
  protected readonly periodo = signal<Periodo>('hoy');
  protected readonly localSeleccionado = signal<number | null>(null);

  protected readonly umbral = UMBRAL_STOCK_BAJO;

  protected readonly esAdminGeneral = computed(() => this.auth.hasRole(AppRole.AdminGeneral));

  // ---------- Locales ----------
  protected readonly localesDisponibles = computed(() => {
    const ids = new Set<number>(this.pedidos().map(p => p.localId));
    if (this.esAdminGeneral()) {
      this.ventas().forEach(v => ids.add(v.localId));
      this.productos().forEach(p => ids.add(p.localId));
    }
    return [...ids].sort((a, b) => a - b);
  });

  // AdminGeneral elige; AdminLocal queda fijo en su local (el de sus pedidos).
  protected readonly localActivo = computed<number | null>(() =>
    this.esAdminGeneral() ? this.localSeleccionado() : (this.localesDisponibles()[0] ?? null)
  );

  private porLocal<T extends { localId: number }>(lista: T[]): T[] {
    const l = this.localActivo();
    return l == null ? lista : lista.filter(x => x.localId === l);
  }

  protected readonly pedidosLocal = computed(() => this.porLocal(this.pedidos()));
  protected readonly ventasLocal = computed(() => this.porLocal(this.ventas()));
  protected readonly productosLocal = computed(() => this.porLocal(this.productos()));
  protected readonly eventosLocal = computed(() =>
    this.porLocal(this.eventos()).sort((a, b) => b.generadoEn.localeCompare(a.generadoEn))
  );

  // ---------- Periodo ----------
  private inicioDia(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private rangoPeriodo(): { desde: Date; hasta: Date; dias: number } | null {
    const p = this.periodo();
    if (p === 'todo') return null;
    const dias = p === 'hoy' ? 1 : 7;
    const hoy = this.inicioDia(new Date());
    const desde = new Date(hoy);
    desde.setDate(desde.getDate() - (dias - 1));
    const hasta = new Date(hoy);
    hasta.setDate(hasta.getDate() + 1);
    return { desde, hasta, dias };
  }

  protected readonly etiquetaPeriodo = computed(() =>
    ({ hoy: 'hoy', semana: 'últimos 7 días', todo: 'histórico' }[this.periodo()])
  );

  protected readonly etiquetaAnterior = computed(() =>
    this.periodo() === 'hoy' ? 'ayer' : 'los 7 días previos'
  );

  protected readonly ventasPeriodo = computed(() => {
    const r = this.rangoPeriodo();
    if (!r) return this.ventasLocal();
    return this.ventasLocal().filter(v => {
      const f = new Date(v.fechaVenta);
      return f >= r.desde && f < r.hasta;
    });
  });

  private readonly ventasPeriodoAnterior = computed(() => {
    const r = this.rangoPeriodo();
    if (!r) return [];
    const ini = new Date(r.desde);
    ini.setDate(ini.getDate() - r.dias);
    return this.ventasLocal().filter(v => {
      const f = new Date(v.fechaVenta);
      return f >= ini && f < r.desde;
    });
  });

  // ---------- KPIs ----------
  protected readonly totalVentas = computed(() =>
    this.ventasPeriodo().reduce((s, v) => s + v.total, 0)
  );

  protected readonly cantidadVentas = computed(() => this.ventasPeriodo().length);

  protected readonly ticketPromedio = computed(() =>
    this.cantidadVentas() ? this.totalVentas() / this.cantidadVentas() : 0
  );

  protected readonly variacion = computed<number | null>(() => {
    if (this.periodo() === 'todo') return null;
    const anterior = this.ventasPeriodoAnterior().reduce((s, v) => s + v.total, 0);
    if (anterior <= 0) return null;
    return ((this.totalVentas() - anterior) / anterior) * 100;
  });

  protected readonly variacionAbs = computed(() => Math.abs(this.variacion() ?? 0));

  protected readonly pedidosActivos = computed(() =>
    this.pedidosLocal().filter(p => ESTADOS_ACTIVOS.includes(p.estado))
  );
  protected readonly enPreparacion = computed(() =>
    this.pedidosLocal().filter(p => p.estado === 'EN_PREPARACION').length
  );
  protected readonly enReparto = computed(() =>
    this.pedidosLocal().filter(p => p.estado === 'EN_REPARTO').length
  );

  protected readonly stockBajo = computed(() =>
    this.productosLocal()
      .filter(p => p.activo && p.stock <= UMBRAL_STOCK_BAJO)
      .sort((a, b) => a.stock - b.stock)
  );

  protected readonly localDestacado = computed(() => {
    const filas = this.ventasPorLocal();
    return filas.length ? filas[0] : null;
  });

  // ---------- Gráficos ----------
  protected readonly tendencia = computed<Barra[]>(() => {
    const porHora = this.periodo() === 'hoy';
    const mapa = new Map<number, Barra>();
    const dosDig = (n: number) => String(n).padStart(2, '0');

    if (porHora) {
      for (let h = 0; h < 24; h++) mapa.set(h, { etiqueta: `${h}h`, valor: 0, pct: 0 });
    }
    for (const v of this.ventasPeriodo()) {
      const f = new Date(v.fechaVenta);
      const clave = porHora ? f.getHours() : this.inicioDia(f).getTime();
      const etiqueta = porHora ? `${f.getHours()}h` : `${dosDig(f.getDate())}/${dosDig(f.getMonth() + 1)}`;
      const fila = mapa.get(clave) ?? { etiqueta, valor: 0, pct: 0 };
      fila.valor += v.total;
      mapa.set(clave, fila);
    }
    const filas = [...mapa.entries()].sort((a, b) => a[0] - b[0]).map(e => e[1]).slice(-14 - (porHora ? 10 : 0));
    const max = Math.max(...filas.map(f => f.valor), 0);
    return filas.map(f => ({ ...f, pct: max ? (f.valor / max) * 100 : 0 }));
  });

  protected readonly pedidosPorEstado = computed<Barra[]>(() => {
    const conteo = new Map<string, number>();
    this.pedidosLocal().forEach(p => conteo.set(p.estado, (conteo.get(p.estado) ?? 0) + 1));
    const max = Math.max(...conteo.values(), 0);
    return ESTADOS_ORDEN.map(e => ({
      etiqueta: e,
      valor: conteo.get(e) ?? 0,
      pct: max ? ((conteo.get(e) ?? 0) / max) * 100 : 0
    }));
  });

  protected readonly topProductos = computed<Barra[]>(() => {
    const conteo = new Map<string, number>();
    for (const v of this.ventasPeriodo()) {
      for (const it of v.items ?? []) {
        conteo.set(it.nombreProducto, (conteo.get(it.nombreProducto) ?? 0) + it.cantidad);
      }
    }
    const top = [...conteo.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const max = top.length ? top[0][1] : 0;
    return top.map(([etiqueta, valor]) => ({ etiqueta, valor, pct: max ? (valor / max) * 100 : 0 }));
  });

  protected readonly ventasPorLocal = computed<Barra[]>(() => {
    const suma = new Map<number, number>();
    this.ventasPeriodo().forEach(v => suma.set(v.localId, (suma.get(v.localId) ?? 0) + v.total));
    const filas = [...suma.entries()].sort((a, b) => b[1] - a[1]);
    const max = filas.length ? filas[0][1] : 0;
    return filas.map(([id, valor]) => ({
      etiqueta: `Local ${id}`, valor, pct: max ? (valor / max) * 100 : 0
    }));
  });

  protected readonly feed = computed(() => this.eventosLocal().slice(0, 12));

  // ---------- Ciclo de vida ----------
  ngOnInit(): void {
    const autorizado = this.auth.hasAnyRole([AppRole.AdminLocal, AppRole.AdminGeneral]);
    if (!autorizado) {
      this.router.navigateByUrl('/dashboard');
      return;
    }
    this.cargar();
    const timer = setInterval(() => {
      if (this.autoRefresh()) this.cargar();
    }, REFRESCO_MS);
    this.destroyRef.onDestroy(() => clearInterval(timer));
  }

  protected cargar(): void {
    this.cargando.set(true);
    const fallos: string[] = [];

    // Si una fuente falla, las demás siguen funcionando y se conserva el dato anterior.
    const seguro = <T>(nombre: string, obs: Observable<T[]>): Observable<T[] | null> =>
      obs.pipe(catchError(err => {
        fallos.push(`${nombre} (${err?.status || 'sin respuesta'})`);
        return of(null);
      }));

    forkJoin({
      pedidos: seguro('Pedidos', this.pedidoService.pedidosAdmin()),
      ventas: seguro('Ventas', this.ventaService.listar()),
      productos: seguro('Productos', this.productoService.listar()),
      eventos: seguro('Streaming', this.streamingService.resultados())
    }).subscribe(r => {
      if (r.pedidos) this.pedidos.set(r.pedidos);
      if (r.ventas) this.ventas.set(r.ventas);
      if (r.productos) this.productos.set(r.productos);
      if (r.eventos) this.eventos.set(r.eventos);
      this.errores.set(fallos);
      this.ultimaActualizacion.set(new Date());
      this.cargando.set(false);
    });
  }

  protected cambiarLocal(valor: string): void {
    this.localSeleccionado.set(valor === '' ? null : Number(valor));
  }

  protected cambiarPeriodo(valor: string): void {
    this.periodo.set(valor as Periodo);
  }
}