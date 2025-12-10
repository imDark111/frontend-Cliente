import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Reserva, ApiResponse } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiUrl = `${environment.apiUrl}/reservas`;

  constructor(private http: HttpClient) {}

  obtenerMisReservas(): Observable<ApiResponse<Reserva[]>> {
    return this.http.get<ApiResponse<Reserva[]>>(`${this.apiUrl}/mis-reservas`);
  }

  obtenerReservaPorId(id: string): Observable<ApiResponse<Reserva>> {
    return this.http.get<ApiResponse<Reserva>>(`${this.apiUrl}/${id}`);
  }

  crearReserva(data: Partial<Reserva>): Observable<ApiResponse<Reserva>> {
    return this.http.post<ApiResponse<Reserva>>(this.apiUrl, data);
  }

  cancelarReserva(id: string): Observable<ApiResponse<Reserva>> {
    return this.http.put<ApiResponse<Reserva>>(`${this.apiUrl}/${id}/cancelar`, {});
  }
}
