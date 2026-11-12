import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/enviroment';

export interface ResultadoStreaming {
  tipo: 'VENTAS_TOTAL' | 'PEDIDOS_POR_ESTADO' | 'STOCK_BAJO' | string;
  localId: number;
  clave: string;
  valor: number;
  ventanaInicio: string | null;
  ventanaFin: string | null;
  generadoEn: string;
}

@Injectable({ providedIn: 'root' })
export class StreamingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/pedidos/admin/streaming`;

  resultados(localId?: number): Observable<ResultadoStreaming[]> {
    let params = new HttpParams();
    if (localId != null) params = params.set('localId', localId);
    return this.http.get<ResultadoStreaming[]>(this.baseUrl, { params });
  }
}