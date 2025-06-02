import { useState, useEffect } from 'react';
import { Instrumento } from '../types/types';
import { CarritoItem, Pedido, PedidoDetalle, CarritoState } from '../types/pedido';
import { savePedido } from '../service/api';
import { authService } from '../service/authService';

const initialState: CarritoState = {
    items: [],
    mostrarCarrito: false,
    mensajePedido: null
};

export const useCarrito = () => {
    const [carritoState, setCarritoState] = useState<CarritoState>(initialState);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    //cargar carrito desde localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('carrito');
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                setCarritoState(prevState => ({
                    ...prevState,
                    items: parsedCart.items || []
                }));
            } catch (err) {
                console.error('Error al cargar el carrito:', err);
            }
        }
    }, []);

    //guardar carrito en localStorage
    useEffect(() => {
        localStorage.setItem('carrito', JSON.stringify({
            items: carritoState.items
        }));
    }, [carritoState.items]);

    //agregar instrumento al carrito
    const agregarAlCarrito = (instrumento: Instrumento, cantidad: number = 1) => {
        setCarritoState(prevState => {
            const itemIndex = prevState.items.findIndex(
                item => item.instrumento.idInstrumento === instrumento.idInstrumento
            );

            let newItems;
            if (itemIndex >= 0) {
                newItems = [...prevState.items];
                newItems[itemIndex] = {
                    ...newItems[itemIndex],
                    cantidad: newItems[itemIndex].cantidad + cantidad
                };
            } else {
                newItems = [...prevState.items, { instrumento, cantidad }];
            }

            return {
                ...prevState,
                items: newItems,
                mostrarCarrito: true
            };
        });
    };

    //actualizar cantidad - CORREGIDO para number ID
    const actualizarCantidad = (instrumentoIdStr: string, cantidad: number) => {
        const instrumentoId = parseInt(instrumentoIdStr);

        if (cantidad <= 0) return eliminarDelCarrito(instrumentoIdStr);

        setCarritoState(prevState => {
            const newItems = prevState.items.map(item =>
                item.instrumento.idInstrumento === instrumentoId
                    ? { ...item, cantidad }
                    : item
            );

            return {
                ...prevState,
                items: newItems
            };
        });
    };

    //eliminar del carrito - CORREGIDO para number ID
    const eliminarDelCarrito = (instrumentoIdStr: string) => {
        const instrumentoId = parseInt(instrumentoIdStr);

        setCarritoState(prevState => ({
            ...prevState,
            items: prevState.items.filter(item => item.instrumento.idInstrumento !== instrumentoId)
        }));
    };

    const vaciarCarrito = () => {
        setCarritoState(prevState => ({
            ...prevState,
            items: []
        }));
    };

    const toggleCarrito = () => {
        setCarritoState(prevState => ({
            ...prevState,
            mostrarCarrito: !prevState.mostrarCarrito
        }));
    };

    //crear pedido adaptado a tu backend
    const crearPedido = (): Pedido => {
        const detalles: PedidoDetalle[] = carritoState.items.map(item => ({
            instrumentoId: item.instrumento.idInstrumento!,
            cantidad: item.cantidad,
            precioUnitario: item.instrumento.precioActual || 0
        }));

        return {
            detalles
        };
    };

    //guardar pedido
    const guardarPedido = async () => {
        if (carritoState.items.length === 0) {
            setError('No hay items en el carrito');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const currentUser = authService.getUserFromStorage();

            if (!currentUser || !currentUser.id) {
                setError('Debes iniciar sesión para guardar el pedido');
                return;
            }

            const pedido = crearPedido();
            console.log('Enviando pedido:', pedido);

            const pedidoGuardado = await savePedido(pedido);
            console.log('Pedido guardado recibido:', pedidoGuardado);

            // Verificar que el pedido tenga ID
            if (!pedidoGuardado.idPedido) {
                console.error('Error: El pedido no tiene ID:', pedidoGuardado);
                setError('Error: No se recibió ID de pedido válido');
                return null;
            }

            setCarritoState({
                items: [],
                mostrarCarrito: true,
                mensajePedido: `Pedido #${pedidoGuardado.idPedido} guardado correctamente`
            });

            // No limpiar automáticamente el mensaje aquí
            // Se limpiará cuando el usuario haga el pago o cierre manualmente

            return pedidoGuardado;
        } catch (err) {
            console.error('Error al guardar el pedido:', err);
            setError('Error al guardar el pedido');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const limpiarMensaje = () => {
        setCarritoState(prevState => ({
            ...prevState,
            mensajePedido: null
        }));
    };

    const totalItems = carritoState.items.reduce(
        (sum, item) => sum + item.cantidad,
        0
    );

    const totalPrecio = carritoState.items.reduce((sum, item) => {
        const precio = item.instrumento.precioActual || 0;
        return sum + (precio * item.cantidad);
    }, 0);

    return {
        items: carritoState.items,
        mostrarCarrito: carritoState.mostrarCarrito,
        mensajePedido: carritoState.mensajePedido,
        loading,
        error,
        totalItems,
        totalPrecio,
        agregarAlCarrito,
        actualizarCantidad,
        eliminarDelCarrito,
        vaciarCarrito,
        toggleCarrito,
        guardarPedido,
        limpiarMensaje
    };
};

//Hook personalizado useCarrito para manejar la lógica del carrito.