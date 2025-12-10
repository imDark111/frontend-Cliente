import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  // Datos del usuario
  nombreUsuario: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  nombres: string = '';
  apellidos: string = '';
  cedula: string = '';
  fechaNacimiento: string = '';
  telefono: string = '';
  direccion: string = '';

  // Estados de UI
  cargando: boolean = false;
  error: string = '';
  mostrarPassword: boolean = false;
  mostrarConfirmPassword: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    // Validar campos requeridos
    if (!this.nombreUsuario || !this.email || !this.password || 
        !this.nombres || !this.apellidos || !this.cedula) {
      this.error = 'Por favor completa todos los campos obligatorios';
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.error = 'Por favor ingresa un correo electrónico válido';
      return;
    }

    // Validar longitud de contraseña
    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    // Validar que las contraseñas coincidan
    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    // Validar cédula (10 dígitos)
    if (!/^\d{10}$/.test(this.cedula)) {
      this.error = 'La cédula debe tener 10 dígitos';
      return;
    }

    // Validar teléfono si está presente (10 dígitos)
    if (this.telefono && !/^\d{10}$/.test(this.telefono)) {
      this.error = 'El teléfono debe tener 10 dígitos';
      return;
    }

    // Validar fecha de nacimiento
    if (this.fechaNacimiento) {
      const fechaNac = new Date(this.fechaNacimiento);
      const hoy = new Date();
      const edad = hoy.getFullYear() - fechaNac.getFullYear();
      if (edad < 18) {
        this.error = 'Debes ser mayor de 18 años para registrarte';
        return;
      }
    }

    this.cargando = true;
    this.error = '';

    const nuevoCliente = {
      nombreUsuario: this.nombreUsuario,
      email: this.email,
      password: this.password,
      nombres: this.nombres,
      apellidos: this.apellidos,
      cedula: this.cedula,
      fechaNacimiento: this.fechaNacimiento,
      telefono: this.telefono,
      direccion: this.direccion
    };

    this.authService.register(nuevoCliente).subscribe({
      next: (response: any) => {
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error('❌ Error en registro:', err);
        this.cargando = false;
        this.error = err.error?.mensaje || 'Error al registrar usuario. Por favor intenta de nuevo.';
      }
    });
  }

  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  toggleConfirmPassword() {
    this.mostrarConfirmPassword = !this.mostrarConfirmPassword;
  }
}
