import { Instrumento } from './types';

//item en el carrito
export interface CarritoItem {
    instrumento: Instrumento;
    cantidad: number;
}

//detalle de un pedido
export interface PedidoDetalle {
    instrumentoId: number;
    cantidad: number;
    precioUnitario: number;
}

//pedido completo - actualizado para coincidir con la respuesta real del backend
export interface Pedido {
    idPedido?: number;           
    fecha?: Date | string;       
    totalPedido?: number;
    detalles: PedidoDetalle[];
    usuarioId?: number;          
    usuario?: {                  
        idUsuario: number;
        nombre: string;
        apellido: string;
        email: string;
        rol: {
            idRol: number;
            definicion: string;
        };
    };
    estado?: string;             
    estadoActual?: string;       
    estados?: Array<{            
        idEstadoPedido: number;
        estado: string;
        fecha: string;
    }>;
}

//estado del carrito
export interface CarritoState {
    items: CarritoItem[];
    mostrarCarrito: boolean;
    mensajePedido: string | null;
}