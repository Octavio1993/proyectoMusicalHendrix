import React, { useState, useEffect } from 'react';
import { Pedido } from '../../types/pedido';
import { Instrumento } from '../../types/types';
import { fetchPedidosByUsuario, fetchInstrumentoById } from '../../service/api';
import { useAuth } from '../../context/AuthContext';
import Loading from '../common/Loading';
import Error from '../common/Error';
import './MisPedidos.css';

//interfaz extendida para pedidos con información del instrumento
interface PedidoConInstrumento extends Pedido {
    detallesConInstrumento?: Array<{
        instrumentoId: number;
        cantidad: number;
        precioUnitario: number;
        instrumento?: Instrumento;
    }>;
}

const MisPedidos: React.FC = () => {
    const [pedidos, setPedidos] = useState<PedidoConInstrumento[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedPedidoId, setExpandedPedidoId] = useState<number | null>(null);

    const { user } = useAuth();

    useEffect(() => {
        const loadPedidos = async () => {
            if (!user || !user.id) {
                setError('No se ha podido identificar al usuario');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                //carga los pedidos del usuario usando tu API existente
                const misPedidos = await fetchPedidosByUsuario(user.id);
                
                //enriquece los pedidos con informacion de instrumentos
                const pedidosEnriquecidos = await Promise.all(
                    misPedidos.map(async (pedido) => {
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

                        return {
                            ...pedido,
                            detallesConInstrumento
                        } as PedidoConInstrumento;
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

    if (loading) return <Loading message="Cargando tus pedidos..." />;
    if (error) return <Error message={error} />;
    if (pedidos.length === 0) {
        return (
            <div className="mis-pedidos-container">
                <h2>Mis Pedidos</h2>
                <div className="no-pedidos">
                    <p>No tienes pedidos realizados aún.</p>
                    <p>
                        <a href="/productos" className="link">Ver productos disponibles</a>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mis-pedidos-container">
            <h2>Mis Pedidos</h2>

            <div className="pedidos-list">
                {pedidos.map(pedido => (
                    <div
                        key={pedido.idPedido}
                        className={`pedido-card ${expandedPedidoId === pedido.idPedido ? 'expanded' : ''}`}
                    >
                        <div className="pedido-header" onClick={() => pedido.idPedido && toggleExpandPedido(pedido.idPedido)}>
                            <div className="pedido-basic-info">
                                <span className="pedido-id">Pedido #{pedido.idPedido}</span>
                                <span className="pedido-date">{formatDate(pedido.fecha)}</span>
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
                                        //si tenemos detalles enriquecidos, usamos esos
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
                                        //si no tenemos detalles enriquecidos, usamos los basicos
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
        </div>
    );
};

export default MisPedidos;