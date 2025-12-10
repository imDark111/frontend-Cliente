// Exportar entidades desde carpeta compartida
// Nota: En producción, considere crear un paquete npm compartido
export interface Usuario {
  _id?: string;
  id: string;
  nombreUsuario: string;
  email: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  fechaNacimiento: Date;
  telefono?: string;
  direccion?: string;
  fotoPerfil: string;
  rol: 'cliente' | 'admin';
  twoFactorEnabled: boolean;
  dobleAutenticacion?: boolean;
  activo: boolean;
  reservasRealizadas: number;
  esFrecuente: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Departamento {
  id: string;
  numero: string;
  tipo: 'individual' | 'doble' | 'matrimonial' | 'suite' | 'presidencial';
  descripcion?: string;
  piso: number;
  precioNoche: number;
  capacidadPersonas: number;
  numeroCamas: number;
  tipoCamas: 'individual' | 'matrimonial' | 'queen' | 'king' | 'mixta';
  caracteristicas: {
    televisor: boolean;
    wifi: boolean;
    aireAcondicionado: boolean;
    calefaccion: boolean;
    minibar: boolean;
    cajaFuerte: boolean;
    balcon: boolean;
    vistaAlMar: boolean;
    banoPrivado: boolean;
    jacuzzi: boolean;
    cocina: boolean;
    escritorio: boolean;
    secadorPelo: boolean;
    plancha: boolean;
    telefono: boolean;
  };
  imagenes: Array<{
    url: string;
    descripcion?: string;
  }>;
  estado: 'disponible' | 'ocupado' | 'mantenimiento' | 'reservado';
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cliente {
  _id?: string;
  id: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  fechaNacimiento: Date;
  email: string;
  telefono: string;
  direccion?: string;
  nacionalidad?: string;
  reservasRealizadas: number;
  esFrecuente: boolean;
  usuarioAsociado?: string;
  dobleAutenticacion?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reserva {
  id: string;
  codigoReserva: string;
  usuario: Usuario | string;
  cliente: Cliente | string;
  departamento: Departamento | string;
  fechaInicio: Date;
  fechaFin: Date;
  numeroNoches: number;
  numeroHuespedes: number;
  precioNoche: number;
  subtotal: number;
  descuentoClienteFrecuente: number;
  aplicaIVA: boolean;
  iva: number;
  esFeriado: boolean;
  recargoPorcentaje: number;
  recargoFeriado: number;
  total: number;
  estado: 'pendiente' | 'confirmada' | 'en-curso' | 'completada' | 'cancelada';
  checkIn: {
    realizado: boolean;
    fecha?: Date;
    realizadoPor?: string;
  };
  checkOut: {
    realizado: boolean;
    fecha?: Date;
    realizadoPor?: string;
  };
  observaciones?: string;
  solicitudesEspeciales?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Factura {
  id: string;
  numeroFactura: string;
  reserva: Reserva | string;
  cliente: Cliente | string;
  fechaEmision: Date;
  subtotal: number;
  descuentos: {
    clienteFrecuente: number;
    otros: number;
  };
  iva: number;
  recargos: {
    feriado: number;
    otros: number;
  };
  danos: Array<{
    descripcion: string;
    monto: number;
    fecha: Date;
  }>;
  totalDanos: number;
  total: number;
  estadoPago: 'pendiente' | 'pagada' | 'parcial' | 'anulada';
  metodoPago?: string;
  pagos: Array<{
    fecha: Date;
    monto: number;
    metodo: string;
    referencia?: string;
  }>;
  observaciones?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  requiresTwoFactor?: boolean;
  userId?: string;
  message?: string;
  data?: {
    usuario: Usuario;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
  error?: any;
}
