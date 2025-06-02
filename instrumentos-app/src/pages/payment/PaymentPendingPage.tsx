import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PaymentPages.css';

const PaymentPendingPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const pedidoId = queryParams.get('pedido_id');

    const [countdown, setCountdown] = useState(7);

    useEffect(() => {
        if (countdown <= 0) {
            navigate('/');
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, navigate]);

    return (
        <div className="payment-status-page pending">
            <div className="status-icon">⏳</div>
            <h1>Pago en Proceso</h1>

            <div className="payment-details">
                <p>Tu pago está siendo procesado.</p>
                {pedidoId && <p>Pedido: <strong>#{pedidoId}</strong></p>}
                <p>Esto puede tomar unos minutos. Te notificaremos cuando se complete.</p>
            </div>

            <div className="payment-actions">
                <button
                    className="btn-primary"
                    onClick={() => navigate('/')}
                >
                    Volver a la tienda
                </button>
            </div>

            <div className="redirect-countdown">
                <p>Redirigiendo a la página principal en <strong>{countdown}</strong> segundos...</p>
            </div>
        </div>
    );
};

export default PaymentPendingPage;