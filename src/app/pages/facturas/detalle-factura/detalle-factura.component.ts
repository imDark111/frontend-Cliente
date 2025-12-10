import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FacturaService } from '../../../services/factura.service';
import { Factura } from '../../../models/interfaces';

@Component({
  selector: 'app-detalle-factura',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-factura.component.html',
  styleUrl: './detalle-factura.component.css'
})
export class DetalleFacturaComponent implements OnInit {
  factura: Factura | null = null;
  cargando = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private facturaService: FacturaService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarFactura(id);
    } else {
      this.router.navigate(['/facturas']);
    }
  }

  cargarFactura(id: string) {
    this.facturaService.obtenerFacturaPorId(id).subscribe({
      next: (response: any) => {
        console.log('📄 Factura recibida del backend:', response.data);
        console.log('📄 Cliente:', response.data?.cliente);
        console.log('📄 Reserva:', response.data?.reserva);
        if (response.success && response.data) {
          this.factura = {
            ...response.data,
            id: response.data.id || response.data._id
          };
        }
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.error = 'Error al cargar la factura';
        this.cargando = false;
      }
    });
  }

  descargarPDF() {
    if (!this.factura) return;

    this.facturaService.descargarFacturaPDF(this.factura.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `factura-${this.factura!.numeroFactura}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error: any) => {
        console.error('Error al descargar PDF:', error);
        alert('Error al descargar la factura en PDF');
      }
    });
  }

  imprimir() {
    window.print();
  }

  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(monto);
  }

  formatearFecha(fecha: string | Date): string {
    return new Date(fecha).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  volver() {
    this.router.navigate(['/facturas']);
  }

  irAPagar() {
    if (this.factura && this.factura.id) {
      this.router.navigate(['/pagar', this.factura.id]);
    }
  }

  // Helper methods para acceder a propiedades anidadas
  getClienteNombre(): string {
    if (!this.factura?.cliente || typeof this.factura.cliente === 'string') return 'N/A';
    return `${this.factura.cliente.nombres} ${this.factura.cliente.apellidos}`;
  }

  getClienteCedula(): string {
    if (!this.factura?.cliente || typeof this.factura.cliente === 'string') return 'N/A';
    return this.factura.cliente.cedula;
  }

  getClienteEmail(): string {
    if (!this.factura?.cliente || typeof this.factura.cliente === 'string') return 'N/A';
    return this.factura.cliente.email;
  }

  getClienteTelefono(): string {
    if (!this.factura?.cliente || typeof this.factura.cliente === 'string') return 'N/A';
    return this.factura.cliente.telefono || 'N/A';
  }

  getReservaCodigoReserva(): string {
    if (!this.factura?.reserva || typeof this.factura.reserva === 'string') return 'N/A';
    return this.factura.reserva.codigoReserva;
  }

  getReservaDepartamento(): string {
    if (!this.factura?.reserva || typeof this.factura.reserva === 'string') return 'N/A';
    const depto = this.factura.reserva.departamento;
    if (typeof depto === 'string') return 'N/A';
    return depto?.numero || 'N/A';
  }

  getReservaFechaInicio(): string {
    if (!this.factura?.reserva || typeof this.factura.reserva === 'string') return 'N/A';
    return this.formatearFecha(this.factura.reserva.fechaInicio);
  }

  getReservaFechaFin(): string {
    if (!this.factura?.reserva || typeof this.factura.reserva === 'string') return 'N/A';
    return this.formatearFecha(this.factura.reserva.fechaFin);
  }

  getReservaNumeroNoches(): number {
    if (!this.factura?.reserva || typeof this.factura.reserva === 'string') return 0;
    return this.factura.reserva.numeroNoches;
  }

  getReservaNumeroHuespedes(): number {
    if (!this.factura?.reserva || typeof this.factura.reserva === 'string') return 0;
    return this.factura.reserva.numeroHuespedes;
  }
}
