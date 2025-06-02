import React, { createContext, useContext, ReactNode } from 'react';
import { useCarrito } from '../hooks/useCarrito';
import { Instrumento } from '../types/types';
import { CarritoItem } from '../types/pedido';

//interface para el contexto
interface CarritoContextType {
    items: CarritoItem[];
    mostrarCarrito: boolean;
    mensajePedido: string | null;
    loading: boolean;
    error: string | null;
    totalItems: number;
    totalPrecio: number;
    agregarAlCarrito: (instrumento: Instrumento, cantidad?: number) => void;
    actualizarCantidad: (instrumentoId: string, cantidad: number) => void;
    eliminarDelCarrito: (instrumentoId: string) => void;
    vaciarCarrito: () => void;
    toggleCarrito: () => void;
    guardarPedido: () => Promise<any>;
    limpiarMensaje: () => void;
}

//crear el contexto
const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

//hook para usar el contexto
export const useCarritoContext = () => {
    const context = useContext(CarritoContext);
    if (!context) {
        throw new Error('useCarritoContext debe ser usado dentro de un CarritoProvider');
    }
    return context;
};

//props del proveedor
interface CarritoProviderProps {
    children: ReactNode;
}

//proveedor del contexto
export const CarritoProvider: React.FC<CarritoProviderProps> = ({ children }) => {
    //usa useCarrito para la lógica
    const carrito = useCarrito();

    return (
        <CarritoContext.Provider value={carrito}>
            {children}
        </CarritoContext.Provider>
    );
};

//Contexto CarritoContext para compartir el estado del carrito en toda la aplicación.