import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

interface IntencionPago {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  factura: {
    id: string;
    numeroFactura: string;
    total: number;
    montoPendiente: number;
  };
}

interface ConfirmacionPago {
  factura: any;
  paymentIntent: {
    id: string;
    amount: number;
    status: string;
  };
}

interface TarjetaPrueba {
  tipo: string;
  numero: string;
  cvv: string;
  fecha: string;
  resultado: string;
}

interface TarjetasPruebaResponse {
  nota: string;
  tarjetas: TarjetaPrueba[];
  documentacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private apiUrl = `${environment.apiUrl}/pagos`;

  constructor(private http: HttpClient) {}

  /**
   * Crear intención de pago con Stripe
   */
  crearIntencionPago(facturaId: string): Observable<ApiResponse<IntencionPago>> {
    return this.http.post<ApiResponse<IntencionPago>>(`${this.apiUrl}/crear-intencion`, {
      facturaId
    });
  }

  /**
   * Confirmar pago exitoso
   */
  confirmarPago(paymentIntentId: string, facturaId: string): Observable<ApiResponse<ConfirmacionPago>> {
    return this.http.post<ApiResponse<ConfirmacionPago>>(`${this.apiUrl}/confirmar`, {
      paymentIntentId,
      facturaId
    });
  }

  /**
   * Obtener tarjetas de prueba para desarrollo
   */
  obtenerTarjetasPrueba(): Observable<ApiResponse<TarjetasPruebaResponse>> {
    return this.http.get<ApiResponse<TarjetasPruebaResponse>>(`${this.apiUrl}/tarjetas-prueba`);
  }
}
