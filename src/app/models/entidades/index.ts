// Entidades compartidas entre Admin y Cliente
export interface Usuario {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  rol: 'admin' | 'empleado';
  activo: boolean;
  foto?: string;
  dobleFactorActivo?: boolean;
  fechaCreacion: Date;
  ultimoAcceso?: Date;
}

export interface Cliente {
  id: string;
  cedula: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  direccion?: string;
  clienteFrecuente: boolean;
  fechaRegistro: Date;
}

export interface Departamento {
  id: string;
  numero: string;
  tipo: 'simple' | 'doble' | 'suite';
  capacidad: number;
  precioPorNoche: number;
  caracteristicas: string[];
  imagenes: string[];
  estado: 'disponible' | 'ocupado' | 'mantenimiento' | 'limpieza';
  descripcion?: string;
}

export interface Reserva {
  id: string;
  codigoReserva: string;
  cliente: string | Cliente;
  departamento: string | Departamento;
  fechaInicio: Date;
  fechaFin: Date;
  numeroNoches: number;
  estado: 'pendiente' | 'confirmada' | 'en-curso' | 'completada' | 'cancelada';
  checkIn: {
    fecha?: Date;
    realizado: boolean;
    realizadoPor?: string;
  };
  checkOut: {
    fecha?: Date;
    realizado: boolean;
    realizadoPor?: string;
  };
  costoTotal: number;
  metodoPago?: string;
  observaciones?: string;
  fechaReserva: Date;
}

export interface Factura {
  id: string;
  numeroFactura: string;
  reserva: string | Reserva;
  cliente: string | Cliente;
  subtotal: number;
  iva: number;
  total: number;
  estado: 'pendiente' | 'pagada' | 'anulada';
  metodoPago?: string;
  fechaPago?: Date;
  danos?: Array<{
    descripcion: string;
    costo: number;
  }>;
  fechaEmision: Date;
}

export interface Log {
  id: string;
  usuario: string | Usuario;
  accion: string;
  descripcion: string;
  fecha: Date;
  ip?: string;
}
