import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Factura, ApiResponse } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class FacturaService {
  private apiUrl = `${environment.apiUrl}/facturas`;

  constructor(private http: HttpClient) {}

  obtenerFacturas(): Observable<ApiResponse<Factura[]>> {
    return this.http.get<ApiResponse<Factura[]>>(this.apiUrl);
  }

  obtenerMisFacturas(): Observable<ApiResponse<Factura[]>> {
    return this.http.get<ApiResponse<Factura[]>>(`${this.apiUrl}/mis-facturas`);
  }

  obtenerFacturaPorId(id: string): Observable<ApiResponse<Factura>> {
    return this.http.get<ApiResponse<Factura>>(`${this.apiUrl}/${id}`);
  }

  descargarFacturaPDF(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, {
      responseType: 'blob'
    });
  }
}
