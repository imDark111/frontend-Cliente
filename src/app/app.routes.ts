import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'departamentos',
    loadComponent: () => import('./pages/departamentos/departamentos.component').then(m => m.DepartamentosComponent)
  },
  {
    path: 'departamentos/:id',
    loadComponent: () => import('./pages/departamentos/detalle-departamento/detalle-departamento.component').then(m => m.DetalleDepartamentoComponent)
  },
  {
    path: 'mis-reservas',
    loadComponent: () => import('./pages/mis-reservas/mis-reservas.component').then(m => m.MisReservasComponent),
    canActivate: [authGuard]
  },
  {
    path: 'reservas/nueva',
    loadComponent: () => import('./pages/reservas/nueva-reserva/nueva-reserva.component').then(m => m.NuevaReservaComponent),
    canActivate: [authGuard]
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent),
    canActivate: [authGuard]
  },
  {
    path: 'facturas',
    loadComponent: () => import('./pages/facturas/facturas.component').then(m => m.FacturasComponent),
    canActivate: [authGuard]
  },
  {
    path: 'facturas/:id',
    loadComponent: () => import('./pages/facturas/detalle-factura/detalle-factura.component').then(m => m.DetalleFacturaComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pagar/:id',
    loadComponent: () => import('./pages/pagar-factura/pagar-factura.component').then(m => m.PagarFacturaComponent),
    canActivate: [authGuard]
  },
  // {
  //   path: 'about',
  //   loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent)
  // },
  // {
  //   path: 'contact',
  //   loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent)
  // },
  {
    path: '**',
    redirectTo: ''
  }
];
