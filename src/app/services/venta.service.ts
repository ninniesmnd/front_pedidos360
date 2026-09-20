import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';

export interface ItemVentaRequest {
  productoId: number;
  cantidad: number;
}

export interface CrearVentaRequest {
  localId: number;
  pedidoId?: number;
  items: ItemVentaRequest[];
}

export interface ItemVenta {
  id: number;
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Venta {
  id: number;
  localId: number;
  pedidoId?: number;
  vendedorEmail: string;
  total: number;
  fechaVenta: string;
  items: ItemVenta[];
}

@Injectable({ providedIn: 'root' })
export class VentaService {
  private baseUrl = `${environment.apiBaseUrl}/api/ventas`;

  constructor(private http: HttpClient) {}

  listar(localId?: number): Observable<Venta[]> {
    let url = this.baseUrl;
    if (localId != null) url += `?localId=${localId}`;
    return this.http.get<Venta[]>(url);
  }

  registrar(request: CrearVentaRequest): Observable<Venta> {
    return this.http.post<Venta>(this.baseUrl, request);
  }
}