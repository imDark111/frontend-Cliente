import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DepartamentoService } from '../../services/departamento.service';
import { Departamento } from '../../models/interfaces';

@Component({
  selector: 'app-departamentos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './departamentos.component.html',
  styleUrl: './departamentos.component.css'
})
export class DepartamentosComponent implements OnInit {
  departamentos: Departamento[] = [];
  cargando = true;

  constructor(
    private departamentoService: DepartamentoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarDepartamentos();
  }

  cargarDepartamentos() {
    this.departamentoService.obtenerDepartamentos({ estado: 'disponible' }).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.departamentos = response.data.map((depto: any) => ({
            ...depto,
            id: depto.id || depto._id
          }));
        }
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error:', error);
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

  getImagenPrincipal(depto: Departamento): string {
    if (depto.imagenes && depto.imagenes.length > 0) {
      const imagenValida = depto.imagenes.find(img => 
        img.url && (img.url.startsWith('http://') || img.url.startsWith('https://') || img.url.startsWith('/'))
      );
      return imagenValida ? imagenValida.url : 'assets/placeholder-room.jpg';
    }
    return 'assets/placeholder-room.jpg';
  }
}
