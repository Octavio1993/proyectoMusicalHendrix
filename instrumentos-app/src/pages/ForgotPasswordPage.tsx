import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import './AuthPages.css';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!email) {
            setError('Por favor ingresa tu email');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Por favor ingresa un email válido');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
            } else {
                setError(data.error || 'Error al enviar solicitud');
            }
        } catch (err) {
            setError('Error de conexión. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h1 className="auth-title">Recuperar Contraseña</h1>

                {message ? (
                    <div className="auth-success">
                        <p>{message}</p>
                        <div className="auth-links">
                            <Link to="/login" className="auth-link">Volver al login</Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="auth-description">
                            Ingresa tu email y te enviaremos un enlace para recuperar tu contraseña.
                        </p>

                        {error && (
                            <div className="auth-error">
                                {error}
                            </div>
                        )}

                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    placeholder="Ingresa tu email"
                                />
                            </div>

                            <button
                                type="submit"
                                className="auth-button"
                                disabled={loading}
                            >
                                {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                            </button>
                        </form>

                        <div className="auth-links">
                            <p>
                                ¿Recordaste tu contraseña?{' '}
                                <Link to="/login" className="auth-link">Iniciar sesión</Link>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;