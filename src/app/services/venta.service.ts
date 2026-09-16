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

@Injectable({ providedIn: 'root' })
export class VentaService {
  private baseUrl = `${environment.apiBaseUrl}/api/ventas`;

  constructor(private http: HttpClient) {}

  listar(localId?: number): Observable<any[]> {
    let url = this.baseUrl;
    if (localId != null) url += `?localId=${localId}`;
    return this.http.get<any[]>(url);
  }

  registrar(request: CrearVentaRequest): Observable<any> {
    return this.http.post<any>(this.baseUrl, request);
  }
}