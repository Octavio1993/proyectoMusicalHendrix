import { Instrumento, Categoria, Usuario } from '../types/types';
import { Pedido } from '../types/pedido';
import { PaymentResponse, PaymentStatus } from '../types/payment';
import { authService } from './authService';

const API_URL = 'http://localhost:8080/api';

// Headers con autenticación X-User-Id (solo cuando sea necesario)
const getHeaders = (requireAuth: boolean = true): HeadersInit => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (requireAuth) {
        const currentUser = authService.getUserFromStorage();
        if (currentUser?.id) {
            headers['X-User-Id'] = currentUser.id.toString();
        }
    }

    return headers;
};

// Headers básicos sin autenticación
const getBasicHeaders = (): HeadersInit => ({
    'Content-Type': 'application/json',
});

// ===== INSTRUMENTOS API =====

//funcion para actualizar el inventario de ventas
export const updatePaymentSales = async (pedidoId: string): Promise<any> => {
    try {
        console.log(`Actualizando manualmente ventas para pedido: ${pedidoId}`);
        const response = await fetch(`${API_URL}/pagos/actualizar-ventas/${pedidoId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al actualizar ventas');
        }

        const data = await response.json();
        console.log('Respuesta de actualización de ventas:', data);
        return data;
    } catch (error) {
        console.error('Error al actualizar ventas:', error);
        throw error;
    }
};

//obtengo todos los instrumentos
export const fetchInstrumentos = async (): Promise<Instrumento[]> => {
    try {
        const response = await fetch(`${API_URL}/instrumentos`, {
            headers: getBasicHeaders()
        });
        if (!response.ok) throw new Error('Error al obtener instrumentos');
        return response.json();
    } catch (error) {
        console.error('Error fetching instrumentos:', error);
        throw error;
    }
};

export const fetchInstrumentosByCategoria = async (idCategoria: number): Promise<Instrumento[]> => {
    try {
        const response = await fetch(`${API_URL}/instrumentos?idCategoria=${idCategoria}`, {
            headers: getBasicHeaders()
        });
        if (!response.ok) throw new Error('Error al obtener instrumentos por categoría');
        return response.json();
    } catch (error) {
        console.error('Error fetching instrumentos by categoria:', error);
        throw error;
    }
};

export const fetchInstrumentoById = async (id: string): Promise<Instrumento> => {
    try {
        const response = await fetch(`${API_URL}/instrumentos/${id}`, {
            headers: getBasicHeaders()
        });
        if (!response.ok) throw new Error('Instrumento no encontrado');
        return response.json();
    } catch (error) {
        console.error('Error fetching instrumento by id:', error);
        throw error;
    }
};

//endpoints que requieren autenticación
export const createInstrumento = async (instrumento: Omit<Instrumento, 'idInstrumento'>): Promise<Instrumento> => {
    try {
        const response = await fetch(`${API_URL}/instrumentos`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({
                codigo: instrumento.codigo,
                denominacion: instrumento.denominacion,
                marca: instrumento.marca,
                stock: instrumento.stock,
                descripcion: instrumento.descripcion,
                imagen: instrumento.imagen,
                categoriaId: instrumento.categoriaInstrumento.idCategoriaInstrumento,
                precio: instrumento.precioActual
            }),
        });

        if (!response.ok) throw new Error('Error al crear instrumento');
        return response.json();
    } catch (error) {
        console.error('Error creating instrumento:', error);
        throw error;
    }
};

export const updateInstrumento = async (id: string | number, instrumento: Omit<Instrumento, 'idInstrumento'>): Promise<Instrumento> => {
    try {
        //validar que categoriaId no sea nulo
        const categoriaId = instrumento.categoriaInstrumento?.idCategoriaInstrumento;
        if (!categoriaId) {
            throw new Error('La categoría del instrumento es requerida');
        }

        const requestBody = {
            codigo: instrumento.codigo,
            denominacion: instrumento.denominacion,
            marca: instrumento.marca,
            stock: instrumento.stock,
            descripcion: instrumento.descripcion,
            imagen: instrumento.imagen,
            categoriaId: categoriaId
        };

        console.log('Actualizando instrumento ID:', id);
        console.log('Datos enviados:', JSON.stringify(requestBody, null, 2));
        console.log('Headers:', getHeaders(true));

        const response = await fetch(`${API_URL}/instrumentos/${id}`, {
            method: 'PUT',
            headers: getHeaders(true),
            body: JSON.stringify(requestBody),
        });

        console.log('Respuesta HTTP:', response.status, response.statusText);

        if (!response.ok) {
            //obtener el mensaje de error del backend
            let errorMessage = 'Error al actualizar instrumento';
            try {
                const errorData = await response.json();
                console.log('Error del backend:', errorData);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                try {
                    const errorText = await response.text();
                    console.log('Error texto del backend:', errorText);
                    if (errorText) errorMessage = errorText;
                } catch (e2) {
                    console.log('No se pudo obtener detalles del error');
                }
            }
            throw new Error(errorMessage);
        }
        return response.json();
    } catch (error) {
        console.error('Error updating instrumento:', error);
        throw error;
    }
};

export const deleteInstrumento = async (id: string | number): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/instrumentos/${id}`, {
            method: 'DELETE',
            headers: getHeaders(true),
        });

        if (!response.ok) throw new Error('Error al eliminar instrumento');
    } catch (error) {
        console.error('Error deleting instrumento:', error);
        throw error;
    }
};

//funcion para actualizar precio (crea historial)
export const updateInstrumentPrice = async (id: string | number, precio: number): Promise<Instrumento> => {
    try {
        console.log(`Actualizando precio del instrumento ${id} a ${precio}`);
        
        const response = await fetch(`${API_URL}/instrumentos/${id}/precio`, {
            method: 'PATCH',
            headers: getHeaders(true),
            body: JSON.stringify({ precio }),
        });

        console.log('Respuesta HTTP:', response.status, response.statusText);

        if (!response.ok) {
            let errorMessage = 'Error al actualizar precio';
            try {
                const errorData = await response.json();
                console.log('Error del backend:', errorData);
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                console.log('No se pudo obtener detalles del error');
            }
            throw new Error(errorMessage);
        }

        const resultado = await response.json();
        console.log('Precio actualizado exitosamente:', resultado);
        return resultado;
    } catch (error) {
        console.error('Error updating price:', error);
        throw error;
    }
};

//actualizar stock
export const updateInstrumentStock = async (id: string | number, cantidad: number): Promise<Instrumento> => {
    try {
        console.log(`Actualizando stock del instrumento ${id} - cantidad: ${cantidad}`);
        
        const response = await fetch(`${API_URL}/instrumentos/${id}/stock`, {
            method: 'PATCH',
            headers: getHeaders(true),
            body: JSON.stringify({ cantidad }),
        });

        console.log('Respuesta HTTP:', response.status, response.statusText);

        if (!response.ok) {
            let errorMessage = 'Error al actualizar stock';
            try {
                const errorData = await response.json();
                console.log('Error del backend:', errorData);
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                console.log('No se pudo obtener detalles del error');
            }
            throw new Error(errorMessage);
        }

        const resultado = await response.json();
        console.log('Stock actualizado exitosamente:', resultado);
        return resultado;
    } catch (error) {
        console.error('Error updating stock:', error);
        throw error;
    }
};

// ===== CATEGORIAS API =====
//obtengo todas las categorias
export const fetchCategorias = async (): Promise<Categoria[]> => {
    try {
        const response = await fetch(`${API_URL}/categorias`, {
            headers: getBasicHeaders()
        });
        if (!response.ok) throw new Error('Error al obtener categorías');
        return response.json();
    } catch (error) {
        console.error('Error fetching categorias:', error);
        throw error;
    }
};

export const fetchCategoriaById = async (id: number): Promise<Categoria> => {
    try {
        const response = await fetch(`${API_URL}/categorias/${id}`, {
            headers: getBasicHeaders()
        });
        if (!response.ok) throw new Error('Categoría no encontrada');
        return response.json();
    } catch (error) {
        console.error('Error fetching categoria by id:', error);
        throw error;
    }
};

// ===== PEDIDOS API =====

//guarda un pedido
export const savePedido = async (pedido: Pedido): Promise<Pedido> => {
    try {
        const response = await fetch(`${API_URL}/pedidos`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify(pedido),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al guardar pedido');
        }

        return response.json();
    } catch (error) {
        console.error('Error saving pedido:', error);
        throw error;
    }
};

export const fetchPedidos = async (): Promise<Pedido[]> => {
    try {
        const response = await fetch(`${API_URL}/pedidos`, {
            headers: getHeaders(true),
        });

        if (!response.ok) throw new Error('Error al obtener pedidos');
        return response.json();
    } catch (error) {
        console.error('Error fetching pedidos:', error);
        throw error;
    }
};

export const fetchPedidosByUsuario = async (usuarioId: number): Promise<Pedido[]> => {
    try {
        const response = await fetch(`${API_URL}/pedidos/usuario/${usuarioId}`, {
            headers: getHeaders(true),
        });

        if (!response.ok) throw new Error('Error al obtener pedidos del usuario');
        return response.json();
    } catch (error) {
        console.error('Error fetching pedidos by usuario:', error);
        throw error;
    }
};

// ===== USUARIOS API =====
//endpoints de usuarios requieren autenticación
export const fetchUsuarios = async (): Promise<Usuario[]> => {
    try {
        const response = await fetch(`${API_URL}/usuarios`, {
            headers: getHeaders(true),
        });

        if (!response.ok) throw new Error('Error al obtener usuarios');
        return response.json();
    } catch (error) {
        console.error('Error fetching usuarios:', error);
        throw error;
    }
};

//usuario por ID
export const fetchUsuarioById = async (id: number): Promise<Usuario> => {
    try {
        const response = await fetch(`${API_URL}/usuarios/${id}`, {
            headers: getHeaders(true),
        });

        if (!response.ok) throw new Error('Usuario no encontrado');
        return response.json();
    } catch (error) {
        console.error('Error fetching usuario by id:', error);
        throw error;
    }
};

export const deleteUsuario = async (id: number): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/usuarios/${id}`, {
            method: 'DELETE',
            headers: getHeaders(true),
        });

        if (!response.ok) throw new Error('Error al eliminar usuario');
    } catch (error) {
        console.error('Error deleting usuario:', error);
        throw error;
    }
};

// ===== PAGOS API =====

//creo un pago para un pedido
export const createPayment = async (pedidoId: string): Promise<PaymentResponse> => {
    try {
        const response = await fetch(`${API_URL}/pagos/crear/${pedidoId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al crear el pago');
        }

        const data = await response.json();
        console.log("Datos recibidos del backend:", data);

        return {
            preference_id: data.preferenceId,
            init_point: data.initPoint,
            sandbox_init_point: data.sandboxInitPoint
        };
    } catch (error) {
        console.error('Error al crear pago:', error);
        return { error: error instanceof Error ? error.message : 'Error desconocido' };
    }
};

//obtengo pagos por ID de pedido
export const fetchPaymentsByPedido = async (pedidoId: string): Promise<PaymentStatus[]> => {
    try {
        const response = await fetch(`${API_URL}/pagos/pedido/${pedidoId}`);

        if (!response.ok) {
            throw new Error('Error al obtener los pagos del pedido');
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};