import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';

export interface Pedido {
  id: number;
  localId: number;
  estado: string;
  tipoDespacho: string;
  fechaCreacion: string;
}

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private baseUrl = `${environment.apiBaseUrl}/api/pedidos`;

  constructor(private http: HttpClient) {}

  misPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.baseUrl}/mis-pedidos`);
  }
}