import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { updatePaymentSales } from '../../service/api';
import Loading from '../../components/common/Loading';
import './PaymentPages.css';

const PaymentSuccessPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const pedidoId = queryParams.get('pedido_id') || localStorage.getItem('last_pedido_id');
    const [updatingVentas, setUpdatingVentas] = useState(false);
    const [ventasUpdated, setVentasUpdated] = useState(false);
    const [countdown, setCountdown] = useState(5);

    //actualiza el inventario
    useEffect(() => {
        const updateVentas = async () => {
            if (!pedidoId) return;

            try {
                setUpdatingVentas(true);

                localStorage.setItem('payment_success', 'true');

                await updatePaymentSales(pedidoId);

                console.log('Ventas actualizadas correctamente para pedido:', pedidoId);
                setVentasUpdated(true);
            } catch (error) {
                console.error('Error al actualizar ventas:', error);
            } finally {
                setUpdatingVentas(false);
            }
        };

        updateVentas();
    }, [pedidoId]);

    useEffect(() => {
        localStorage.removeItem('last_pedido_id');

        return () => {
            localStorage.removeItem('mp_payment_timestamp');
        };
    }, []);

    useEffect(() => {
        if (countdown <= 0) {
            localStorage.setItem('payment_success', 'true');
            navigate('/');
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, navigate]);

    return (
        <div className="payment-status-page success">
            <div className="status-icon">✓</div>
            <h1>¡Pago Procesado!</h1>

            <div className="payment-details">
                <p>Tu pedido ha sido procesado correctamente.</p>
                {pedidoId && <p>Pedido: <strong>#{pedidoId}</strong></p>}
                <p>Recibirás un correo electrónico con los detalles de tu compra.</p>

                {updatingVentas && (
                    <p className="updating-message">Actualizando inventario...</p>
                )}

                {ventasUpdated && (
                    <p className="success-message">¡Inventario actualizado correctamente!</p>
                )}
            </div>

            <div className="redirect-countdown">
                <p>Redirigiendo a la página principal en <strong>{countdown}</strong> segundos...</p>
                <button
                    className="btn-primary"
                    onClick={() => navigate('/')}
                >
                    Ir a la página principal ahora
                </button>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;