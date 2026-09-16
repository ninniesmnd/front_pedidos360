import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';

export interface Producto {
  id: number;
  localId: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private baseUrl = `${environment.apiBaseUrl}/api/productos`;

  constructor(private http: HttpClient) {}

  listar(localId?: number): Observable<Producto[]> {
    let url = this.baseUrl;
    if (localId != null) url += `?localId=${localId}`;
    return this.http.get<Producto[]>(url);
  }

  obtener(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/${id}`);
  }

  actualizarStock(id: number, delta: number): Observable<Producto> {
    return this.http.patch<Producto>(`${this.baseUrl}/${id}/stock`, { delta });
  }
}