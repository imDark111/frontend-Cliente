import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FacturaService } from '../../services/factura.service';
import { Factura } from '../../models/interfaces';

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './facturas.component.html',
  styleUrl: './facturas.component.css'
})
export class FacturasComponent implements OnInit {
  facturas: Factura[] = [];
  cargando = true;
  error = '';

  constructor(private facturaService: FacturaService) {}

  ngOnInit() {
    this.cargarFacturas();
  }

  cargarFacturas() {
    this.facturaService.obtenerFacturas().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.facturas = response.data.map((factura: any) => ({
            ...factura,
            id: factura.id || factura._id
          }));
        }
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.error = 'Error al cargar facturas';
        this.cargando = false;
      }
    });
  }

  descargarPDF(facturaId: string) {
    this.facturaService.descargarFacturaPDF(facturaId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `factura-${facturaId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error: any) => {
        console.error('Error al descargar PDF:', error);
        alert('Error al descargar la factura en PDF');
      }
    });
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

  getEstadoClass(estado: string): string {
    const clases: any = {
      'pagada': 'estado-pagada',
      'pendiente': 'estado-pendiente',
      'parcial': 'estado-parcial',
      'anulada': 'estado-anulada'
    };
    return clases[estado] || '';
  }

  getEstadoTexto(estado: string): string {
    const textos: any = {
      'pagada': 'Pagada',
      'pendiente': 'Pendiente',
      'parcial': 'Pago Parcial',
      'anulada': 'Anulada'
    };
    return textos[estado] || estado;
  }
}
