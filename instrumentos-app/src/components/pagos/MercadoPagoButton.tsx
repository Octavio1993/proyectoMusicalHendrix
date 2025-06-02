import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPayment } from '../../service/api';
import './MercadoPagoButton.css';

interface MercadoPagoButtonProps {
    pedidoId: string;
    onPaymentCreated?: () => void;
    onPaymentError?: (error: string) => void;
}

const MercadoPagoButton: React.FC<MercadoPagoButtonProps> = ({
    pedidoId,
    onPaymentCreated,
    onPaymentError
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentInitiated, setPaymentInitiated] = useState(false);
    const navigate = useNavigate();

    // Debug: Log para verificar que el componente se renderiza
    console.log('MercadoPagoButton renderizado con pedidoId:', pedidoId);

    const handlePayment = async () => {
        if (loading || paymentInitiated) return;

        try {
            setLoading(true);
            setError(null);

            console.log('Creando preferencia de pago para pedido:', pedidoId);

            //guarda el ID del pedido en localStorage para recuperarlo despues de la redireccion
            localStorage.setItem('last_pedido_id', pedidoId);

            //crea la preferencia de pago en el backend
            const response = await createPayment(pedidoId);

            if (response.error) {
                throw new Error(response.error);
            }

            console.log('Respuesta de creación de pago:', response);

            if (response.sandbox_init_point) {
                console.log('Abriendo URL de Mercado Pago:', response.sandbox_init_point);

                //se ha iniciado el pago
                setPaymentInitiated(true);

                //notifica que se ha creado el pago
                if (onPaymentCreated) {
                    onPaymentCreated();
                }

                localStorage.setItem('mp_payment_timestamp', Date.now().toString());
                localStorage.setItem('mp_payment_initiated', 'true');

                //abre la pagina de sandbox de Mercado Pago en una nueva ventana
                window.open(response.sandbox_init_point, '_blank');

                navigate(`/payment/success?pedido_id=${pedidoId}`);
            } else {
                throw new Error('No se recibió la URL de pago');
            }
        } catch (err) {
            console.error('Error al crear el pago:', err);
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);

            if (onPaymentError) {
                onPaymentError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    //si el pago ya se inicio, no mostrar el boton
    if (paymentInitiated) {
        return <p>Procesando pago... Redirigiendo a Mercado Pago.</p>;
    }

    return (
        <div className="mercadopago-button-wrapper">
            <button
                className="iniciar-pago-btn"
                onClick={handlePayment}
                disabled={loading}
                style={{
                    backgroundColor: '#009ee3',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                }}
            >
                {loading ? 'Preparando pago...' : 'Pagar con Mercado Pago'}
            </button>

            {error && (
                <div className="payment-error" style={{ marginTop: '10px', color: 'red' }}>
                    <p>{error}</p>
                    <button
                        className="retry-btn"
                        onClick={() => setError(null)}
                        style={{
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginTop: '5px'
                        }}
                    >
                        Reintentar
                    </button>
                </div>
            )}
        </div>
    );
};

export default MercadoPagoButton;