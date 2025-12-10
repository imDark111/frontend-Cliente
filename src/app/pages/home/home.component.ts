import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private router: Router) {}

  navegarDepartamentos() {
    this.router.navigate(['/departamentos']);
  }

  navegarLogin() {
    this.router.navigate(['/login']);
  }
  features = [
    {
      icon: '🏨',
      title: 'Habitaciones Confortables',
      description: 'Disfruta de nuestras habitaciones equipadas con todas las comodidades'
    },
    {
      icon: '📍',
      title: 'Ubicación Privilegiada',
      description: 'En el corazón de la ciudad, cerca de todo lo que necesitas'
    },
    {
      icon: '⭐',
      title: 'Servicio de Calidad',
      description: 'Atención personalizada y profesional las 24 horas'
    },
    {
      icon: '💰',
      title: 'Mejores Precios',
      description: 'Descuentos especiales para clientes frecuentes'
    }
  ];

  testimonios = [
    {
      nombre: 'Johnny Arica',
      comentario: 'Excelente servicio y atención. Las habitaciones son muy cómodas y limpias.',
      rating: 5
    },
    {
      nombre: 'Victor Limones',
      comentario: 'Muy buena ubicación y precios accesibles. Totalmente recomendado.',
      rating: 5
    },
    {
      nombre: 'Don Day',
      comentario: 'Me encantó la experiencia. El personal es muy amable y servicial.',
      rating: 5
    }
  ];
}
