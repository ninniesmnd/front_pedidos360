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

export interface ItemPedidoRequest {
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
}

export interface CrearPedidoRequest {
  localId: number;
  tipoDespacho: string;
  items: ItemPedidoRequest[];
}

export type EstadoPedido = 
| 'RECIBIDO'
| 'EN_PREPARACION'
| 'LISTO_PARA_DESPACHO'
| 'EN_REPARTO'
| 'ENTREGADO'
| 'CANCELADO';


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

  crearPedido(request: CrearPedidoRequest): Observable<Pedido> {
    return this.http.post<Pedido>(this.baseUrl, request);
  }

  cambiarEstado(id: number, nuevoEstado: EstadoPedido): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.baseUrl}/${id}/estado`, { nuevoEstado });
  }
}