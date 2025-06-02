import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PaymentPages.css';

const PaymentFailurePage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const pedidoId = queryParams.get('pedido_id');

    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (countdown <= 0) {
            //pagina principal
            navigate('/');
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, navigate]);

    return (
        <div className="payment-status-page failure">
            <div className="status-icon">✗</div>
            <h1>Pago No Completado</h1>

            <div className="payment-details">
                <p>Hubo un problema al procesar tu pago.</p>
                {pedidoId && <p>Pedido: <strong>#{pedidoId}</strong></p>}
                <p>Por favor, intenta nuevamente o contacta a atención al cliente.</p>
            </div>

            <div className="payment-actions">
                <button
                    className="btn-secondary"
                    onClick={() => navigate('/')}
                >
                    Volver a la tienda
                </button>
                {pedidoId && (
                    <button
                        className="btn-primary"
                        onClick={() => navigate(`/payment/retry/${pedidoId}`)}
                    >
                        Reintentar pago
                    </button>
                )}
            </div>

            <div className="redirect-countdown">
                <p>Redirigiendo a la página principal en <strong>{countdown}</strong> segundos...</p>
            </div>
        </div>
    );
};

export default PaymentFailurePage;