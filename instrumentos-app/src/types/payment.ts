export interface PaymentPreference {
  preference_id: string;
  init_point: string;
  sandbox_init_point: string;
}

export interface PaymentResponse {
  error?: string;
  preference_id?: string;
  init_point?: string;
  sandbox_init_point?: string;
}

export interface PaymentStatus {
  id: string;
  pedidoId: string;
  estado: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  monto: number;
  moneda: string;
  descripcion: string;
}