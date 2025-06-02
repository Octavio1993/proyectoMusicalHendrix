import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Loading from '../../components/common/Loading';

const PaymentRedirectPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const status = queryParams.get('status') || 'pending';
        const pedidoId = queryParams.get('pedido_id') || localStorage.getItem('last_pedido_id');

        if (!pedidoId) {
            navigate('/');
            return;
        }

        let targetPage = '/';

        switch (status) {
            case 'approved':
                targetPage = `/payment/success?pedido_id=${pedidoId}`;
                break;
            case 'rejected':
                targetPage = `/payment/failure?pedido_id=${pedidoId}`;
                break;
            case 'pending':
                targetPage = `/payment/pending?pedido_id=${pedidoId}`;
                break;
            default:
                targetPage = '/';
        }

        console.log('Redirigiendo a:', targetPage);

        setTimeout(() => {
            navigate(targetPage);
        }, 500);
    }, [location, navigate]);

    return (
        <div className="payment-redirect-page">
            <Loading message="Procesando resultado del pago..." />
        </div>
    );
};

export default PaymentRedirectPage;