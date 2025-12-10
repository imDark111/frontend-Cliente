import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/interfaces';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  cliente: Usuario | null = null;
  editando: boolean = false;
  cargando: boolean = false;
  error: string = '';
  exito: string = '';

  // Datos editables
  nombres: string = '';
  apellidos: string = '';
  telefono: string = '';
  direccion: string = '';
  fechaNacimiento: string = '';

  // Cambio de contraseña
  cambiarPassword: boolean = false;
  passwordActual: string = '';
  passwordNuevo: string = '';
  confirmarPassword: string = '';

  // 2FA
  mostrar2FA: boolean = false;
  dobleAutenticacion: boolean = false;
  qrCode: string = '';
  codigo2FA: string = '';
  secreto2FA: string = '';

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarPerfil();
  }

  cargarPerfil() {
    this.cargando = true;
    this.authService.getMe().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.cliente = response.data;
          this.nombres = this.cliente.nombres || '';
          this.apellidos = this.cliente.apellidos || '';
          this.telefono = this.cliente.telefono || '';
          this.direccion = this.cliente.direccion || '';
          this.fechaNacimiento = this.cliente.fechaNacimiento ? 
            new Date(this.cliente.fechaNacimiento).toISOString().split('T')[0] : '';
          this.dobleAutenticacion = this.cliente.dobleAutenticacion || this.cliente.twoFactorEnabled || false;
        }
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('❌ Error al cargar perfil:', err);
        this.error = 'Error al cargar los datos del perfil';
        this.cargando = false;
      }
    });
  }

  toggleEditar() {
    if (this.editando) {
      // Cancelar edición
      this.cargarPerfil();
    }
    this.editando = !this.editando;
    this.error = '';
    this.exito = '';
  }

  guardarCambios() {
    if (!this.cliente) return;

    this.cargando = true;
    this.error = '';
    this.exito = '';

    const datosActualizados: any = {
      nombres: this.nombres,
      apellidos: this.apellidos,
      telefono: this.telefono,
      direccion: this.direccion,
      fechaNacimiento: this.fechaNacimiento
    };

    this.usuarioService.actualizarPerfil(datosActualizados).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.exito = 'Perfil actualizado correctamente';
          this.editando = false;
          this.cargarPerfil();
        }
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('❌ Error al actualizar perfil:', err);
        this.error = err.error?.mensaje || 'Error al actualizar el perfil';
        this.cargando = false;
      }
    });
  }

  actualizarPassword() {
    if (!this.passwordActual || !this.passwordNuevo || !this.confirmarPassword) {
      this.error = 'Por favor completa todos los campos de contraseña';
      return;
    }

    if (this.passwordNuevo.length < 6) {
      this.error = 'La nueva contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (this.passwordNuevo !== this.confirmarPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.cargando = true;
    this.error = '';
    this.exito = '';

    this.authService.cambiarPassword(this.passwordActual, this.passwordNuevo).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.exito = 'Contraseña actualizada correctamente';
          this.cambiarPassword = false;
          this.passwordActual = '';
          this.passwordNuevo = '';
          this.confirmarPassword = '';
        }
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('❌ Error al cambiar contraseña:', err);
        this.error = err.error?.mensaje || 'Error al cambiar la contraseña';
        this.cargando = false;
      }
    });
  }

  habilitar2FA() {
    this.cargando = true;
    this.error = '';

    this.authService.habilitar2FA().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.qrCode = response.data.qrCode;
          this.secreto2FA = response.data.secret;
          this.mostrar2FA = true;
        }
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('❌ Error al habilitar 2FA:', err);
        this.error = err.error?.mensaje || 'Error al habilitar 2FA';
        this.cargando = false;
      }
    });
  }

  verificar2FA() {
    if (this.codigo2FA.length !== 6) {
      this.error = 'El código debe tener 6 dígitos';
      return;
    }

    this.cargando = true;
    this.error = '';

    this.authService.verificar2FAConfig(this.codigo2FA).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.exito = '¡Autenticación en dos pasos habilitada correctamente!';
          this.mostrar2FA = false;
          this.dobleAutenticacion = true;
          this.codigo2FA = '';
          this.cargarPerfil();
        }
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('❌ Error al verificar 2FA:', err);
        this.error = 'Código incorrecto. Por favor intenta de nuevo.';
        this.cargando = false;
      }
    });
  }

  deshabilitar2FA() {
    if (!confirm('¿Estás seguro de que deseas deshabilitar la autenticación en dos pasos?')) {
      return;
    }

    this.cargando = true;
    this.error = '';

    this.authService.deshabilitar2FA().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.exito = 'Autenticación en dos pasos deshabilitada';
          this.dobleAutenticacion = false;
          this.cargarPerfil();
        }
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('❌ Error al deshabilitar 2FA:', err);
        this.error = err.error?.mensaje || 'Error al deshabilitar 2FA';
        this.cargando = false;
      }
    });
  }

  cancelar2FA() {
    this.mostrar2FA = false;
    this.codigo2FA = '';
    this.qrCode = '';
    this.secreto2FA = '';
    this.error = '';
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
