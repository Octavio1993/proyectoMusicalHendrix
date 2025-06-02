import { useState, useEffect, FormEvent } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import './AuthPages.css';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setError('Token inválido');
                setVerifying(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:8080/api/auth/verify-reset-token/${token}`);
                const data = await response.json();

                if (data.valid) {
                    setTokenValid(true);
                } else {
                    setError('El enlace ha expirado o es inválido');
                }
            } catch (err) {
                setError('Error al verificar el enlace');
            } finally {
                setVerifying(false);
            }
        };

        verifyToken();
    }, [token]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            setError('Por favor completa todos los campos');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch('http://localhost:8080/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Contraseña actualizada exitosamente. Redirigiendo al login...');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(data.error || 'Error al actualizar contraseña');
            }
        } catch (err) {
            setError('Error de conexión. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <h1 className="auth-title">Verificando enlace...</h1>
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <h1 className="auth-title">Enlace inválido</h1>
                    <div className="auth-error">
                        {error || 'El enlace ha expirado o es inválido'}
                    </div>
                    <div className="auth-links">
                        <Link to="/forgot-password" className="auth-link">
                            Solicitar nuevo enlace
                        </Link>
                        <Link to="/login" className="auth-link">
                            Volver al login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h1 className="auth-title">Nueva Contraseña</h1>

                {message ? (
                    <div className="auth-success">
                        <p>{message}</p>
                    </div>
                ) : (
                    <>
                        <p className="auth-description">
                            Ingresa tu nueva contraseña
                        </p>

                        {error && (
                            <div className="auth-error">
                                {error}
                            </div>
                        )}

                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="password">Nueva Contraseña</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    placeholder="Ingresa tu nueva contraseña"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={loading}
                                    placeholder="Confirma tu nueva contraseña"
                                />
                            </div>

                            <button
                                type="submit"
                                className="auth-button"
                                disabled={loading}
                            >
                                {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;