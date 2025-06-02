import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const AccesoDenegadoPage = () => {
    const { user } = useAuth();

    //funcion para obtener el rol como string
    const getUserRol = () => {
        if (!user?.rol) return '';
        if (typeof user.rol === 'object' && 'definicion' in user.rol) {
            return user.rol.definicion;
        }
        return user.rol as string;
    };

    const userRol = getUserRol();

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h1 className="auth-title">Acceso Denegado</h1>

                <div className="access-denied-icon">
                    <span role="img" aria-label="Acceso denegado">🚫</span>
                </div>

                <div className="auth-error">
                    No tienes permisos suficientes para acceder a esta página.
                </div>

                <div className="access-denied-details">
                    <p>
                        {user ? (
                            <>Tu rol actual es <strong>{userRol}</strong> y se requiere un rol superior para acceder.</>
                        ) : (
                            <>Debes iniciar sesión para acceder a esta página.</>
                        )}
                    </p>
                </div>

                <div className="auth-links">
                    <Link to="/" className="auth-button" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                        Volver al inicio
                    </Link>

                    {!user && (
                        <p style={{ marginTop: '20px' }}>
                            ¿Quieres iniciar sesión?{' '}
                            <Link to="/login" className="auth-link">Haz clic aquí</Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccesoDenegadoPage;