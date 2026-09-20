import { Component, EventEmitter, Output, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../../services/producto.service';

@Component({
  selector: 'app-nuevo-producto',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './nuevo-producto.html',
  styleUrl: './nuevo-producto.css'
})
export class NuevoProducto {
  private readonly productoService = inject(ProductoService);

  @Output() creado = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();

  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected localId = 1;
  protected nombre = '';
  protected descripcion = '';
  protected precio: number | null = null;
  protected stock = 0;
  protected categoria = '';

  protected confirmar(): void {
    if (!this.nombre.trim() || this.precio == null || this.precio <= 0) {
      this.error.set('Completa al menos el nombre y un precio válido.');
      return;
    }

    this.enviando.set(true);
    this.error.set(null);

    this.productoService.crear({
      localId: this.localId,
      nombre: this.nombre.trim(),
      descripcion: this.descripcion.trim() || undefined,
      precio: this.precio,
      stock: this.stock,
      categoria: this.categoria.trim() || undefined
    }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.creado.emit();
      },
      error: (err) => {
        this.enviando.set(false);
        this.error.set(`Error ${err.status}: no se pudo crear el producto.`);
      }
    });
  }
}