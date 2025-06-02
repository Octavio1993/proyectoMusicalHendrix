import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from '../common/Loading';
import { UserRol } from '../../types/auth';

interface ProtectedRouteProps {
    allowedRoles?: UserRol[];
}

//componente que protege las rutas
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return <Loading message="Verificando autenticación..." />;
    }

    //si el usuario no esta autenticado, redirige a la pagina de inicio de sesion
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    //si el usuario no tiene los roles requeridos, redirige a la pagina de acceso denegado
    if (allowedRoles && allowedRoles.length > 0 && user) {
        const hasAllowedRole = allowedRoles.includes(user.rol as UserRol);

        if (!hasAllowedRole) {
            return <Navigate to="/acceso-denegado" replace />;
        }
    }

    //si esta autenticado y tiene los roles requeridos, renderiza el componente hijo
    return <Outlet />;
};

export default ProtectedRoute;