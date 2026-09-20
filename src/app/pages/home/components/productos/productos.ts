import { Component, inject, signal, computed, viewChild, ElementRef, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Card } from '../../../../shared/components/card/card';
import { AuthService } from '../../../../core/auth/auth.service';
import { ProductoService, Producto } from '../../../../services/producto.service';

@Component({
  selector: 'app-productos',
  imports: [Card, RouterLink],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class Productos implements OnInit {
  private static readonly LIMITE_CARRUSEL = 10;

  private readonly authService = inject(AuthService);
  private readonly productoService = inject(ProductoService);

  protected readonly estaAutenticado = this.authService.isAuthenticated;
  protected readonly productos = signal<Producto[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly productosCarrusel = computed(() =>
    this.productos().slice(0, Productos.LIMITE_CARRUSEL)
  );

  private readonly carrusel = viewChild<ElementRef<HTMLDivElement>>('carrusel');

  protected readonly enInicio = signal(true);
  protected readonly enFinal = signal(false);

  ngOnInit(): void {
    if (!this.estaAutenticado()) return;

    this.cargando.set(true);
    this.productoService.listar().subscribe({
      next: (productos) => {
        this.productos.set(productos.filter(p => p.activo));
        this.cargando.set(false);
        setTimeout(() => this.actualizarLimites());
      },
      error: () => {
        this.error.set('No pudimos cargar el catálogo en este momento.');
        this.cargando.set(false);
      }
    });
  }

  protected desplazarCarrusel(direccion: 1 | -1): void {
    const elemento = this.carrusel()?.nativeElement;
    if (!elemento) return;
    elemento.scrollBy({ left: direccion * elemento.clientWidth * 0.8, behavior: 'smooth' });
  }

  protected actualizarLimites(): void {
    const elemento = this.carrusel()?.nativeElement;
    if (!elemento) return;
    this.enInicio.set(elemento.scrollLeft <= 1);
    this.enFinal.set(elemento.scrollLeft + elemento.clientWidth >= elemento.scrollWidth - 1);
  }
}