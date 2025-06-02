import React from 'react';
import MisPedidos from '../components/pedidos/MisPedidos';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const MisPedidosPage: React.FC = () => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return (
            <div className="page-container">
                <div className="auth-required">
                    <h2>Acceso Restringido</h2>
                    <p>Debes iniciar sesión para ver tus pedidos.</p>
                    <div className="auth-links">
                        <Link to="/login" className="btn-primary">Iniciar Sesión</Link>
                        <Link to="/registro" className="btn-secondary">Registrarse</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Mis Pedidos</h1>
                <p>Bienvenido {user?.nombreUsuario}, aquí puedes ver el historial de tus compras.</p>
            </div>

            <MisPedidos />

            <div className="page-actions">
                <Link to="/productos" className="btn-secondary">Ver más productos</Link>
            </div>
        </div>
    );
};

export default MisPedidosPage;