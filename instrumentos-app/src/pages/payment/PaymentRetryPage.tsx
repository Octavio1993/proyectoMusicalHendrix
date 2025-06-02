import React from 'react';
import { useParams } from 'react-router-dom';
import MercadoPagoButton from '../../components/pagos/MercadoPagoButton';
import './PaymentPages.css';

const PaymentRetryPage: React.FC = () => {
    const { pedidoId } = useParams<{ pedidoId: string }>();

    const handlePaymentCreated = () => {
        console.log('Pago reiniciado correctamente');
    };

    const handlePaymentError = (errorMsg: string) => {
        console.error('Error al reiniciar el pago:', errorMsg);
    };

    return (
        <div className="payment-status-page retry">
            <h1>Reintentar Pago</h1>

            <div className="payment-details">
                <p>Pedido: <strong>#{pedidoId}</strong></p>
                <p>Por favor, haz clic en el botón para intentar el pago nuevamente.</p>
            </div>

            {pedidoId && (
                <div className="retry-payment-container">
                    <MercadoPagoButton
                        pedidoId={pedidoId}
                        onPaymentCreated={handlePaymentCreated}
                        onPaymentError={handlePaymentError}
                    />
                </div>
            )}
        </div>
    );
};

export default PaymentRetryPage;