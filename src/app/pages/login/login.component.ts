import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  codigo2FA = '';
  mostrar2FA = false;
  userId = '';
  cargando = false;
  error = '';
  mostrarPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit() {
    if (!this.email || !this.password) {
      this.error = 'Por favor complete todos los campos';
      return;
    }

    this.cargando = true;
    this.error = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        if (response.requiresTwoFactor && response.userId) {
          this.mostrar2FA = true;
          this.userId = response.userId;
          this.error = '';
        } else if (response.success && response.data) {
          this.router.navigate(['/departamentos']);
        }
        this.cargando = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al iniciar sesión';
        this.cargando = false;
      }
    });
  }

  async verify2FA() {
    if (!this.codigo2FA || this.codigo2FA.length !== 6) {
      this.error = 'Por favor ingrese el código de 6 dígitos';
      return;
    }

    this.cargando = true;
    this.error = '';

    this.authService.verify2FA(this.userId, this.codigo2FA).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.router.navigate(['/departamentos']);
        }
        this.cargando = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Código inválido';
        this.cargando = false;
      }
    });
  }

  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  volver2FA() {
    this.mostrar2FA = false;
    this.codigo2FA = '';
    this.error = '';
  }
}
