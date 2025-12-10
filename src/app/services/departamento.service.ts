import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Departamento, ApiResponse } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class DepartamentoService {
  private apiUrl = `${environment.apiUrl}/departamentos`;

  constructor(private http: HttpClient) {}

  obtenerDepartamentos(params?: any): Observable<ApiResponse<Departamento[]>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return this.http.get<ApiResponse<Departamento[]>>(this.apiUrl, { params: httpParams });
  }

  obtenerDepartamentoPorId(id: string): Observable<ApiResponse<Departamento>> {
    return this.http.get<ApiResponse<Departamento>>(`${this.apiUrl}/${id}`);
  }

  verificarDisponibilidad(id: string, fechaInicio: string, fechaFin: string): Observable<ApiResponse<{ disponible: boolean }>> {
    return this.http.get<ApiResponse<{ disponible: boolean }>>(`${this.apiUrl}/${id}/disponibilidad`, {
      params: { fechaInicio, fechaFin }
    });
  }
}
