import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DepartamentoService } from '../../../services/departamento.service';
import { AuthService } from '../../../services/auth.service';
import { Departamento } from '../../../models/interfaces';

@Component({
  selector: 'app-detalle-departamento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-departamento.component.html',
  styleUrl: './detalle-departamento.component.css'
})
export class DetalleDepartamentoComponent implements OnInit {
  departamento: Departamento | null = null;
  cargando = true;
  imagenActual = 0;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private departamentoService: DepartamentoService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarDepartamento(id);
    } else {
      this.router.navigate(['/departamentos']);
    }
  }

  cargarDepartamento(id: string) {
    this.departamentoService.obtenerDepartamentoPorId(id).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.departamento = {
            ...response.data,
            id: response.data.id || response.data._id
          };
        }
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error al cargar departamento:', error);
        this.error = 'No se pudo cargar la información del departamento';
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

  getImagenesValidas(): string[] {
    if (!this.departamento?.imagenes) return [];
    return this.departamento.imagenes
      .filter(img => img.url && (img.url.startsWith('http://') || img.url.startsWith('https://') || img.url.startsWith('/')))
      .map(img => img.url);
  }

  cambiarImagen(index: number) {
    const imagenes = this.getImagenesValidas();
    if (index >= 0 && index < imagenes.length) {
      this.imagenActual = index;
    }
  }

  imagenAnterior() {
    const imagenes = this.getImagenesValidas();
    this.imagenActual = this.imagenActual > 0 ? this.imagenActual - 1 : imagenes.length - 1;
  }

  imagenSiguiente() {
    const imagenes = this.getImagenesValidas();
    this.imagenActual = this.imagenActual < imagenes.length - 1 ? this.imagenActual + 1 : 0;
  }

  getCaracteristicasActivas(): Array<{icono: string, nombre: string}> {
    if (!this.departamento) return [];
    
    type CaracteristicaKey = 'wifi' | 'televisor' | 'aireAcondicionado' | 'calefaccion' | 'minibar' | 'cajaFuerte' | 'balcon' | 'vistaAlMar' | 'banoPrivado' | 'jacuzzi' | 'cocina' | 'escritorio' | 'secadorPelo' | 'plancha' | 'telefono';
    const caracteristicasMap: Array<{key: CaracteristicaKey, icono: string, nombre: string}> = [
      { key: 'wifi', icono: '📶', nombre: 'WiFi' },
      { key: 'televisor', icono: '📺', nombre: 'Televisor' },
      { key: 'aireAcondicionado', icono: '❄️', nombre: 'Aire Acondicionado' },
      { key: 'calefaccion', icono: '🔥', nombre: 'Calefacción' },
      { key: 'minibar', icono: '🧊', nombre: 'Minibar' },
      { key: 'cajaFuerte', icono: '🔒', nombre: 'Caja Fuerte' },
      { key: 'balcon', icono: '🌿', nombre: 'Balcón' },
      { key: 'vistaAlMar', icono: '🌊', nombre: 'Vista al Mar' },
      { key: 'banoPrivado', icono: '🚿', nombre: 'Baño Privado' },
      { key: 'jacuzzi', icono: '🛁', nombre: 'Jacuzzi' },
      { key: 'cocina', icono: '🍳', nombre: 'Cocina' },
      { key: 'escritorio', icono: '💼', nombre: 'Escritorio' },
      { key: 'secadorPelo', icono: '💇', nombre: 'Secador de Pelo' },
      { key: 'plancha', icono: '👔', nombre: 'Plancha' },
      { key: 'telefono', icono: '☎️', nombre: 'Teléfono' }
    ];

    return caracteristicasMap
      .filter(car => this.departamento!.caracteristicas[car.key])
      .map(car => ({ icono: car.icono, nombre: car.nombre }));
  }

  reservar() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    
    if (this.departamento) {
      this.router.navigate(['/reservas/nueva'], { 
        queryParams: { departamentoId: this.departamento.id } 
      });
    }
  }

  volver() {
    this.router.navigate(['/departamentos']);
  }
}
