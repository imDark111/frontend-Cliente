import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReservaService } from '../../services/reserva.service';
import { Reserva } from '../../models/interfaces';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-reservas.component.html',
  styleUrl: './mis-reservas.component.css'
})
export class MisReservasComponent implements OnInit {
  reservas: Reserva[] = [];
  cargando = true;

  constructor(
    private reservaService: ReservaService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarReservas();
  }

  cargarReservas() {
    this.reservaService.obtenerMisReservas().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.reservas = response.data;
        }
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.cargando = false;
      }
    });
  }

  cancelarReserva(id: string) {
    if (confirm('¿Está seguro de cancelar esta reserva?')) {
      this.reservaService.cancelarReserva(id).subscribe({
        next: (response: any) => {
          if (response.success) {
            alert('Reserva cancelada exitosamente');
            this.cargarReservas();
          }
        },
        error: (error: any) => {
          alert('Error al cancelar reserva');
        }
      });
    }
  }

  obtenerColorEstado(estado: string): string {
    const colores: { [key: string]: string } = {
      'pendiente': '#ffc107',
      'confirmada': '#2196f3',
      'en-curso': '#4caf50',
      'completada': '#9e9e9e',
      'cancelada': '#f44336'
    };
    return colores[estado] || '#9e9e9e';
  }

  formatearFecha(fecha: Date | string): string {
    return new Date(fecha).toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(monto);
  }

  puedeCancelar(reserva: Reserva): boolean {
    return reserva.estado === 'pendiente' || reserva.estado === 'confirmada';
  }
}
