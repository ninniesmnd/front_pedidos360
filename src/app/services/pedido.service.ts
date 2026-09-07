import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';

export interface Pedido {
  id: number;
  localId: number;
  clienteEmail: string;
  estado: string;
  tipoDespacho: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  items: ItemPedido[];
}

export interface ItemPedido {
  id: number;
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
}

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private baseUrl = `${environment.apiBaseUrl}/api/pedidos`;

  constructor(private http: HttpClient) {}

  misPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.baseUrl}/mis-pedidos`);
  }

  pedidosCocina(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.baseUrl}/cocina`);
  }

  pedidosDespacho(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.baseUrl}/despacho`);
  }

  pedidosAdmin(localId?: number): Observable<Pedido[]> {
    let params = new HttpParams();
    if (localId != null) params = params.set('localId', localId);
    return this.http.get<Pedido[]>(`${this.baseUrl}/admin`, { params });
  }
}