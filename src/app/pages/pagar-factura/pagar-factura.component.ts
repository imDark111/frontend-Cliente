import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PagoService } from '../../services/pago.service';
import { FacturaService } from '../../services/factura.service';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-pagar-factura',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagar-factura.component.html',
  styleUrls: ['./pagar-factura.component.css']
})
export class PagarFacturaComponent implements OnInit {
  facturaId: string = '';
  factura: any = null;
  cargando: boolean = false;
  procesandoPago: boolean = false;
  error: string = '';
  exito: boolean = false;

  // Stripe
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  cardElement: StripeCardElement | null = null;
  clientSecret: string = '';
  paymentIntentId: string = '';

  // Tarjetas de prueba
  mostrarTarjetasPrueba: boolean = true;
  tarjetasPrueba: any[] = [];

  // Datos de tarjeta simulada
  numeroTarjeta: string = '';
  fechaExpiracion: string = '';
  cvv: string = '';
  nombreTitular: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pagoService: PagoService,
    private facturaService: FacturaService
  ) {}

  async ngOnInit() {
    this.facturaId = this.route.snapshot.paramMap.get('id') || '';
    
    if (this.facturaId) {
      await this.cargarFactura();
      await this.inicializarStripe();
      this.cargarTarjetasPrueba();
    }
  }

  async cargarFactura() {
    this.cargando = true;
    this.facturaService.obtenerFacturaPorId(this.facturaId).subscribe({
      next: (response: any) => {
        console.log('💳 Factura recibida en pagar-factura:', response);
        if (response.success && response.data) {
          this.factura = response.data;
          console.log('💳 Cliente en factura:', this.factura.cliente);
          console.log('💳 Reserva en factura:', this.factura.reserva);
          console.log('💳 Cliente en reserva:', this.factura.reserva?.cliente);
        }
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error al cargar factura:', error);
        this.error = 'Error al cargar la factura';
        this.cargando = false;
      }
    });
  }

  async inicializarStripe() {
    try {
      // Crear intención de pago primero
      this.pagoService.crearIntencionPago(this.facturaId).subscribe({
        next: async (response) => {
          if (response.success && response.data) {
            this.clientSecret = response.data.clientSecret;
            this.paymentIntentId = response.data.paymentIntentId;
            
            // Si es modo simulación (pi_test_), no cargar Stripe real
            if (this.paymentIntentId.startsWith('pi_test_')) {
              console.log('💳 Modo simulación activo - Sin Stripe real');
              this.mostrarFormularioSimulado();
            } else {
              // Intentar cargar Stripe real
              try {
                this.stripe = await loadStripe('pk_test_51QTm5WRwBgjrSJOKaEBbLH9hqjHE9TrGJB5vGLl0V4fYEKLnwD3UOWXJKZk4xYnDQ8vZQ7QX');
                if (this.stripe) {
                  this.montarFormularioTarjeta();
                } else {
                  this.mostrarFormularioSimulado();
                }
              } catch (stripeError) {
                console.warn('Stripe no disponible, usando simulación:', stripeError);
                this.mostrarFormularioSimulado();
              }
            }
          }
        },
        error: (error) => {
          console.error('Error al crear intención de pago:', error);
          this.error = error.error?.message || 'Error al crear intención de pago';
        }
      });
    } catch (error: any) {
      console.error('Error al inicializar pago:', error);
      this.error = error.message;
    }
  }

  montarFormularioTarjeta() {
    if (!this.stripe) return;

    this.elements = this.stripe.elements();
    
    this.cardElement = this.elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#32325d',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          '::placeholder': {
            color: '#aab7c4'
          }
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a'
        }
      }
    });

    this.cardElement.mount('#card-element');

    this.cardElement.on('change', (event) => {
      if (event.error) {
        this.error = event.error.message;
      } else {
        this.error = '';
      }
    });
  }

  mostrarFormularioSimulado() {
    console.log('📝 Mostrando formulario de pago simulado');
  }

  formatearNumeroTarjeta(event: any) {
    let valor = event.target.value.replace(/\s/g, '');
    let formatted = valor.match(/.{1,4}/g)?.join(' ') || valor;
    this.numeroTarjeta = formatted;
    event.target.value = formatted;
  }

  formatearFechaExpiracion(event: any) {
    let valor = event.target.value.replace(/\D/g, '');
    if (valor.length >= 2) {
      valor = valor.substring(0, 2) + '/' + valor.substring(2, 4);
    }
    this.fechaExpiracion = valor;
    event.target.value = valor;
  }

  validarTarjeta(): { valido: boolean; mensaje: string } {
    const numeroLimpio = this.numeroTarjeta.replace(/\s/g, '');
    
    if (!numeroLimpio || numeroLimpio.length < 13) {
      return { valido: false, mensaje: 'Número de tarjeta inválido' };
    }
    
    if (!this.fechaExpiracion || this.fechaExpiracion.length < 5) {
      return { valido: false, mensaje: 'Fecha de expiración inválida' };
    }
    
    if (!this.cvv || this.cvv.length < 3) {
      return { valido: false, mensaje: 'CVV inválido' };
    }

    // Validar fecha no expirada
    const [mes, anio] = this.fechaExpiracion.split('/');
    const hoy = new Date();
    const anioCompleto = 2000 + parseInt(anio);
    const fechaExpira = new Date(anioCompleto, parseInt(mes) - 1);
    
    if (fechaExpira < hoy) {
      return { valido: false, mensaje: 'Tarjeta expirada' };
    }

    return { valido: true, mensaje: '' };
  }

  simularResultadoTarjeta(): { exito: boolean; mensaje: string } {
    const numeroLimpio = this.numeroTarjeta.replace(/\s/g, '');
    
    // Tarjeta rechazada
    if (numeroLimpio === '4000000000000002') {
      return { exito: false, mensaje: 'Tarjeta rechazada por el banco' };
    }
    
    // Fondos insuficientes
    if (numeroLimpio === '4000000000009995') {
      return { exito: false, mensaje: 'Fondos insuficientes' };
    }
    
    // Tarjeta expirada (además de la validación de fecha)
    if (numeroLimpio === '4000000000000069') {
      return { exito: false, mensaje: 'Tarjeta expirada' };
    }
    
    // CVV incorrecto
    if (numeroLimpio === '4000000000000127') {
      return { exito: false, mensaje: 'CVV incorrecto' };
    }
    
    // Tarjetas exitosas (4242..., 5555..., 4000002760003184, etc.)
    return { exito: true, mensaje: 'Pago aprobado' };
  }

  async procesarPago() {
    this.procesandoPago = true;
    this.error = '';

    try {
      // Modo simulación - confirmar directamente
      if (this.paymentIntentId.startsWith('pi_test_') || !this.stripe) {
        console.log('💳 Procesando pago en modo simulación');
        
        // Validar datos de tarjeta
        const validacion = this.validarTarjeta();
        if (!validacion.valido) {
          this.error = validacion.mensaje;
          this.procesandoPago = false;
          return;
        }
        
        // Simular delay de procesamiento
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simular resultado según el número de tarjeta
        const resultado = this.simularResultadoTarjeta();
        if (!resultado.exito) {
          this.error = resultado.mensaje;
          this.procesandoPago = false;
          return;
        }
        
        console.log('✅ ' + resultado.mensaje);
        
        // Confirmar pago directamente en el backend
        this.pagoService.confirmarPago(this.paymentIntentId, this.facturaId).subscribe({
          next: (response) => {
            if (response.success) {
              this.exito = true;
              setTimeout(() => {
                this.router.navigate(['/facturas']);
              }, 3000);
            }
          },
          error: (error: any) => {
            console.error('Error al confirmar pago:', error);
            this.error = error.error?.message || 'Error al procesar el pago';
            this.procesandoPago = false;
          },
          complete: () => {
            this.procesandoPago = false;
          }
        });
        
        return;
      }

      // Modo Stripe real
      if (!this.stripe || !this.cardElement || !this.clientSecret) {
        this.error = 'Error: Sistema de pago no inicializado';
        this.procesandoPago = false;
        return;
      }

      const { error, paymentIntent } = await this.stripe.confirmCardPayment(this.clientSecret, {
        payment_method: {
          card: this.cardElement
        }
      });

      if (error) {
        this.error = error.message || 'Error al procesar el pago';
        this.procesandoPago = false;
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirmar pago en el backend
        this.pagoService.confirmarPago(this.paymentIntentId, this.facturaId).subscribe({
          next: (response) => {
            if (response.success) {
              this.exito = true;
              setTimeout(() => {
                this.router.navigate(['/facturas']);
              }, 3000);
            }
          },
          error: (error: any) => {
            console.error('Error al confirmar pago:', error);
            this.error = 'El pago fue exitoso pero hubo un error al registrarlo. Contacta con soporte.';
          },
          complete: () => {
            this.procesandoPago = false;
          }
        });
      }
    } catch (error: any) {
      console.error('Error al procesar pago:', error);
      this.error = error.message || 'Error al procesar el pago';
      this.procesandoPago = false;
    }
  }

  cargarTarjetasPrueba() {
    this.pagoService.obtenerTarjetasPrueba().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.tarjetasPrueba = response.data.tarjetas;
        }
      },
      error: (error) => {
        console.error('Error al cargar tarjetas de prueba:', error);
      }
    });
  }

  getClienteNombre(): string {
    // Intentar obtener cliente desde factura directamente
    if (this.factura?.cliente && typeof this.factura.cliente === 'object') {
      const cliente = this.factura.cliente;
      // El modelo usa 'nombres' y 'apellidos' (plural)
      return `${cliente.nombres || cliente.nombre || ''} ${cliente.apellidos || cliente.apellido || ''}`.trim() || 'N/A';
    }
    
    // Si no está en factura, intentar desde reserva
    if (this.factura?.reserva?.cliente && typeof this.factura.reserva.cliente === 'object') {
      const cliente = this.factura.reserva.cliente;
      return `${cliente.nombres || cliente.nombre || ''} ${cliente.apellidos || cliente.apellido || ''}`.trim() || 'N/A';
    }
    
    return 'N/A';
  }

  getReservaCodigoReserva(): string {
    return this.factura?.reserva?.codigoReserva || 'N/A';
  }

  calcularMontoPendiente(): number {
    if (!this.factura) return 0;
    const totalPagado = this.factura.pagos?.reduce((sum: number, pago: any) => sum + pago.monto, 0) || 0;
    return this.factura.total - totalPagado;
  }

  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(monto);
  }

  volver() {
    this.router.navigate(['/facturas']);
  }
}
