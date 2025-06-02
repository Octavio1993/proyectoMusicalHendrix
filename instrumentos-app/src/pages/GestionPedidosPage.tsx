import React, { useState, useEffect } from 'react';
import { Pedido } from '../types/pedido';
import { Instrumento, Usuario } from '../types/types';
import { fetchPedidos, fetchInstrumentoById, fetchUsuarioById } from '../service/api'; // Agregar fetchUsuarioById
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';
import Error from '../components/common/Error';
import './AdminStyles.css';

interface PedidoConUsuario extends Pedido {
    nombreUsuario?: string;
    rolUsuario?: string;
    detallesConInstrumento?: Array<{
        instrumentoId: number;
        cantidad: number;
        precioUnitario: number;
        instrumento?: Instrumento;
    }>;
}

const GestionPedidosPage: React.FC = () => {
    const [pedidos, setPedidos] = useState<PedidoConUsuario[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedPedidoId, setExpandedPedidoId] = useState<number | null>(null);
    const [filterDateFrom, setFilterDateFrom] = useState<string>('');
    const [filterDateTo, setFilterDateTo] = useState<string>('');

    const { user } = useAuth();

    const getUserRol = () => {
        if (!user?.rol) return '';
        if (typeof user.rol === 'object' && 'definicion' in user.rol) {
            return user.rol.definicion;
        }
        return user.rol as string;
    };

    useEffect(() => {
        const loadPedidos = async () => {
            const userRol = getUserRol();
            if (!user || userRol !== 'Admin') {
                setError('No tienes permisos para acceder a esta información');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                //cargar todos los pedidos
                const allPedidos = await fetchPedidos();

                //enriquecer pedidos con informacion de instrumentos y usuarios
                const pedidosEnriquecidos = await Promise.all(
                    allPedidos.map(async (pedido) => {
                        const detallesConInstrumento = await Promise.all(
                            pedido.detalles.map(async (detalle) => {
                                try {
                                    const instrumento = await fetchInstrumentoById(detalle.instrumentoId.toString());
                                    return {
                                        ...detalle,
                                        instrumento
                                    };
                                } catch (error) {
                                    console.error(`Error al cargar instrumento ${detalle.instrumentoId}:`, error);
                                    return detalle;
                                }
                            })
                        );

                        //info del usuario (ya viene en el pedido)
                        let nombreUsuario = 'Usuario Desconocido';
                        let rolUsuario = '';

                        if (pedido.usuario) {
                            nombreUsuario = `${pedido.usuario.nombre} ${pedido.usuario.apellido}`;
                            rolUsuario = pedido.usuario.rol?.definicion || '';
                        }

                        return {
                            ...pedido,
                            detallesConInstrumento,
                            nombreUsuario,
                            rolUsuario
                        } as PedidoConUsuario;
                    })
                );

                setPedidos(pedidosEnriquecidos);
            } catch (err) {
                setError('Error al cargar los pedidos');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadPedidos();
    }, [user]);

    const toggleExpandPedido = (pedidoId: number) => {
        if (expandedPedidoId === pedidoId) {
            setExpandedPedidoId(null);
        } else {
            setExpandedPedidoId(pedidoId);
        }
    };

    const formatDate = (dateString?: Date | string | null) => {
        if (!dateString) return 'Fecha no disponible';

        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    //filtro de pedidos por fecha
    const filteredPedidos = pedidos.filter(pedido => {
        if (!pedido.fecha) return false;

        const pedidoDate = new Date(pedido.fecha);

        if (filterDateFrom) {
            const fromDate = new Date(filterDateFrom);
            if (pedidoDate < fromDate) return false;
        }

        if (filterDateTo) {
            const toDate = new Date(filterDateTo);
            toDate.setHours(23, 59, 59, 999);
            if (pedidoDate > toDate) return false;
        }

        return true;
    });

    if (loading) return <Loading message="Cargando pedidos..." />;
    if (error) return <Error message={error} />;

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>Gestión de Pedidos</h1>
                <p>Administración de todos los pedidos realizados</p>
            </div>

            <div className="filter-container">
                <div className="date-filters">
                    <div className="filter-group">
                        <label htmlFor="date-from">Desde:</label>
                        <input
                            type="date"
                            id="date-from"
                            value={filterDateFrom}
                            onChange={(e) => setFilterDateFrom(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label htmlFor="date-to">Hasta:</label>
                        <input
                            type="date"
                            id="date-to"
                            value={filterDateTo}
                            onChange={(e) => setFilterDateTo(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {filteredPedidos.length === 0 ? (
                <div className="no-data">
                    No hay pedidos para mostrar con los filtros actuales.
                </div>
            ) : (
                <div className="pedidos-list">
                    {filteredPedidos.map(pedido => (
                        <div
                            key={pedido.idPedido}
                            className={`pedido-card admin-pedido ${expandedPedidoId === pedido.idPedido ? 'expanded' : ''}`}
                        >
                            <div className="pedido-header" onClick={() => pedido.idPedido && toggleExpandPedido(pedido.idPedido)}>
                                <div className="pedido-basic-info">
                                    <span className="pedido-id">Pedido #{pedido.idPedido}</span>
                                    <span className="pedido-date">{formatDate(pedido.fecha)}</span>
                                </div>

                                <div className="pedido-user-info">
                                    <span className="pedido-user">
                                        Cliente: {pedido.nombreUsuario}
                                    </span>
                                    {pedido.rolUsuario && <span className="pedido-user-role">({pedido.rolUsuario})</span>}
                                </div>

                                <div className="pedido-status-price">
                                    <span className={`pedido-status status-${(pedido.estado || 'PENDIENTE').toLowerCase()}`}>
                                        {pedido.estado || 'PENDIENTE'}
                                    </span>
                                    <span className="pedido-total">${pedido.totalPedido?.toLocaleString()}</span>
                                </div>

                                <div className="pedido-expand-icon">
                                    {expandedPedidoId === pedido.idPedido ? '▲' : '▼'}
                                </div>
                            </div>

                            {expandedPedidoId === pedido.idPedido && (
                                <div className="pedido-details">
                                    <h4>Productos en este pedido</h4>

                                    <div className="pedido-items">
                                        {pedido.detallesConInstrumento ? (
                                            pedido.detallesConInstrumento.map((detalle, index) => (
                                                <div key={index} className="pedido-item">
                                                    {detalle.instrumento ? (
                                                        <>
                                                            <div className="item-image">
                                                                <img
                                                                    src={`/images/${detalle.instrumento.imagen}`}
                                                                    alt={detalle.instrumento.denominacion}
                                                                    onError={(e) => {
                                                                        e.currentTarget.src = '/placeholder.jpg';
                                                                    }}
                                                                />
                                                            </div>

                                                            <div className="item-info">
                                                                <h5>{detalle.instrumento.denominacion}</h5>
                                                                <p className="item-brand-code">
                                                                    {detalle.instrumento.marca} - Código: {detalle.instrumento.codigo}
                                                                </p>
                                                                <p className="item-category">
                                                                    Categoría: {detalle.instrumento.categoriaInstrumento.denominacion}
                                                                </p>
                                                            </div>

                                                            <div className="item-price">
                                                                <p className="price">${detalle.precioUnitario.toLocaleString()}</p>
                                                                <p className="quantity">Cantidad: {detalle.cantidad}</p>
                                                                <p className="subtotal">
                                                                    Subtotal: ${(detalle.precioUnitario * detalle.cantidad).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="item-basic-info">
                                                            <p>Producto ID: {detalle.instrumentoId}</p>
                                                            <p>Cantidad: {detalle.cantidad}</p>
                                                            <p>Precio: ${detalle.precioUnitario.toLocaleString()}</p>
                                                            <p>Subtotal: ${(detalle.precioUnitario * detalle.cantidad).toLocaleString()}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            pedido.detalles.map((detalle, index) => (
                                                <div key={index} className="pedido-item">
                                                    <div className="item-basic-info">
                                                        <p>Producto ID: {detalle.instrumentoId}</p>
                                                        <p>Cantidad: {detalle.cantidad}</p>
                                                        <p>Precio: ${detalle.precioUnitario.toLocaleString()}</p>
                                                        <p>Subtotal: ${(detalle.precioUnitario * detalle.cantidad).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="pedido-summary">
                                        <div className="summary-row">
                                            <span>Total del Pedido:</span>
                                            <span className="total-price">${pedido.totalPedido?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GestionPedidosPage;