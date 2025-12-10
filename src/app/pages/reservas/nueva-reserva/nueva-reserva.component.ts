import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DepartamentoService } from '../../../services/departamento.service';
import { ReservaService } from '../../../services/reserva.service';
import { AuthService } from '../../../services/auth.service';
import { Departamento } from '../../../models/interfaces';

@Component({
  selector: 'app-nueva-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nueva-reserva.component.html',
  styleUrl: './nueva-reserva.component.css'
})
export class NuevaReservaComponent implements OnInit {
  departamento: Departamento | null = null;
  cargando = false;
  error = '';
  exito = false;

  // Datos de la reserva
  fechaInicio: string = '';
  fechaFin: string = '';
  numeroPersonas: number = 1;
  observaciones: string = '';

  // Validación
  disponible: boolean | null = null;
  verificando = false;
  mostrarResumen = false;

  // Cálculos
  numeroNoches = 0;
  subtotal = 0;
  impuestos = 0;
  total = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private departamentoService: DepartamentoService,
    private reservaService: ReservaService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Verificar autenticación
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    // Obtener ID del departamento
    const departamentoId = this.route.snapshot.queryParamMap.get('departamentoId');
    if (departamentoId) {
      this.cargarDepartamento(departamentoId);
    } else {
      this.router.navigate(['/departamentos']);
    }

    // Establecer fecha mínima (hoy)
    const hoy = new Date();
    this.fechaInicio = hoy.toISOString().split('T')[0];
    
    // Establecer fecha fin mínima (mañana)
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    this.fechaFin = manana.toISOString().split('T')[0];
  }

  cargarDepartamento(id: string) {
    this.cargando = true;
    this.departamentoService.obtenerDepartamentoPorId(id).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.departamento = {
            ...response.data,
            id: response.data.id || response.data._id
          };
          this.numeroPersonas = 1;
        }
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.error = 'No se pudo cargar la información del departamento';
        this.cargando = false;
      }
    });
  }

  verificarDisponibilidad() {
    if (!this.departamento || !this.fechaInicio || !this.fechaFin) {
      this.error = 'Por favor completa las fechas';
      return;
    }

    if (new Date(this.fechaInicio) >= new Date(this.fechaFin)) {
      this.error = 'La fecha de salida debe ser posterior a la fecha de entrada';
      return;
    }

    if (this.numeroPersonas > this.departamento.capacidadPersonas) {
      this.error = `La habitación tiene capacidad máxima de ${this.departamento.capacidadPersonas} personas`;
      return;
    }

    this.verificando = true;
    this.error = '';

    this.departamentoService.verificarDisponibilidad(
      this.departamento.id,
      this.fechaInicio,
      this.fechaFin
    ).subscribe({
      next: (response: any) => {
        this.disponible = response.data?.disponible || false;
        if (this.disponible) {
          this.calcularPrecios();
          this.mostrarResumen = true;
        } else {
          this.error = 'La habitación no está disponible para las fechas seleccionadas';
        }
        this.verificando = false;
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.error = 'Error al verificar disponibilidad';
        this.verificando = false;
      }
    });
  }

  calcularPrecios() {
    if (!this.departamento) return;

    const inicio = new Date(this.fechaInicio);
    const fin = new Date(this.fechaFin);
    this.numeroNoches = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));

    this.subtotal = this.numeroNoches * this.departamento.precioNoche;
    this.impuestos = this.subtotal * 0.12; // IVA 12%
    this.total = this.subtotal + this.impuestos;
  }

  confirmarReserva() {
    if (!this.departamento || !this.disponible) return;

    this.cargando = true;
    this.error = '';

    const reservaData: any = {
      departamentoId: this.departamento.id,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      numeroHuespedes: this.numeroPersonas,
      solicitudesEspeciales: this.observaciones || undefined,
      esFeriado: false
    };

    this.reservaService.crearReserva(reservaData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.exito = true;
          setTimeout(() => {
            this.router.navigate(['/mis-reservas']);
          }, 2000);
        }
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.error = error.error?.message || error.error?.mensaje || 'Error al crear la reserva';
        this.cargando = false;
      }
    });
  }

  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(monto);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-EC', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  cancelar() {
    if (this.departamento) {
      this.router.navigate(['/departamentos', this.departamento.id]);
    } else {
      this.router.navigate(['/departamentos']);
    }
  }

  editarFechas() {
    this.mostrarResumen = false;
    this.disponible = null;
  }
}
