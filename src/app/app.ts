import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend-Cliente');
  mostrarMenu = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  toggleMenu() {
    this.mostrarMenu = !this.mostrarMenu;
  }

  cerrarMenu() {
    this.mostrarMenu = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
    this.cerrarMenu();
  }
}
