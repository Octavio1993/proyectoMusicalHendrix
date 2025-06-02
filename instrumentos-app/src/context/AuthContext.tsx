import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LoginRequest, LoginResponse, RegistroRequest, AuthState, UserRol } from '../types/auth';
import { authService } from '../service/authService';

interface AuthContextProps {
    user: LoginResponse | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isOperador: boolean;
    isVisor: boolean;
    login: (credentials: LoginRequest) => Promise<LoginResponse>;
    register: (userData: RegistroRequest) => Promise<any>;
    logout: () => void;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

//componente proveedor de autenticación
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        loading: true,
        error: null,
        isAuthenticated: false
    });

    //verifica si el usuario ya esta autenticado al cargar la aplicacion
    useEffect(() => {
        const checkAuth = () => {
            const user = authService.getUserFromStorage();
            if (user) {
                setState({
                    user,
                    loading: false,
                    error: null,
                    isAuthenticated: true
                });
            } else {
                setState({
                    user: null,
                    loading: false,
                    error: null,
                    isAuthenticated: false
                });
            }
        };

        checkAuth();
    }, []);

    //funcion para iniciar sesion
    const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
        try {
            setState({ ...state, loading: true, error: null });
            const response = await authService.login(credentials);

            if (response.success) {
                authService.saveUserToStorage(response);
                setState({
                    user: response,
                    loading: false,
                    error: null,
                    isAuthenticated: true
                });
            } else {
                setState({
                    ...state,
                    loading: false,
                    error: response.message || 'Error de autenticación',
                    isAuthenticated: false
                });
            }

            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            setState({
                ...state,
                loading: false,
                error: errorMessage,
                isAuthenticated: false
            });
            throw error;
        }
    };

    //registro de usuario
    const register = async (userData: RegistroRequest): Promise<any> => {
        try {
            setState({ ...state, loading: true, error: null });
            const response = await authService.register(userData);
            setState({ ...state, loading: false });
            return response;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            setState({
                ...state,
                loading: false,
                error: errorMessage
            });
            throw error;
        }
    };

    //cerrar sesion
    const logout = () => {
        authService.removeUserFromStorage();
        setState({
            user: null,
            loading: false,
            error: null,
            isAuthenticated: false
        });
    };

    const clearError = () => {
        setState({ ...state, error: null });
    };

    //funcion helper para extraer rol del usuario
    const getUserRole = (): string | null => {
        if (!state.user) return null;
        
        //si viene como string directo (compatibilidad)
        if (typeof state.user.rol === 'string') {
            return state.user.rol;
        }
        
        //si viene como objeto del backend
        if (state.user.rol && typeof state.user.rol === 'object' && 'definicion' in state.user.rol) {
            return (state.user.rol as any).definicion;
        }
        
        return null;
    };

    const contextValues: AuthContextProps = {
        user: state.user,
        loading: state.loading,
        error: state.error,
        isAuthenticated: state.isAuthenticated,
        //hace uso de helper para obtener el rol
        isAdmin: getUserRole() === UserRol.ADMIN,
        isOperador: getUserRole() === UserRol.OPERADOR,
        isVisor: getUserRole() === UserRol.VISOR,
        login,
        register,
        logout,
        clearError
    };

    return (
        <AuthContext.Provider value={contextValues}>
            {children}
        </AuthContext.Provider>
    );
};

//hook para acceder al contexto de autenticacion
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

export default AuthContext;