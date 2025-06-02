import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRol } from '../types/auth';
import './AuthPages.css';

const RegistroPage = () => {
    const navigate = useNavigate();
    const { register, error: authError, clearError } = useAuth();

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        clave: '',
        confirmarClave: '',
        rol: UserRol.VISOR //por defecto, todos los usuarios se registran como Visor
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
        if (authError) clearError();
    };

    //envio del formulario
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!formData.nombre || !formData.apellido || !formData.email || !formData.clave || !formData.confirmarClave) {
            setError('Por favor complete todos los campos');
            return;
        }

        if (formData.clave !== formData.confirmarClave) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (formData.clave.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        //valida formato de email basico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Por favor ingrese un email válido');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const registerData = {
                nombre: formData.nombre,
                apellido: formData.apellido,
                email: formData.email,
                clave: formData.clave,
                rol: formData.rol
            };

            //registro del usuario
            await register(registerData);

            setSuccess('Usuario registrado exitosamente. Redirigiendo al login...');

            //a pagina de login
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al registrar usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h1 className="auth-title">Registrarse</h1>

                {(error || authError) && (
                    <div className="auth-error">
                        {error || authError}
                    </div>
                )}

                {success && (
                    <div className="auth-success">
                        {success}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre</label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            disabled={loading || !!success}
                            placeholder="Ingrese su nombre"
                            maxLength={50}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="apellido">Apellido</label>
                        <input
                            type="text"
                            id="apellido"
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            disabled={loading || !!success}
                            placeholder="Ingrese su apellido"
                            maxLength={50}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading || !!success}
                            placeholder="Ingrese su email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="clave">Contraseña</label>
                        <input
                            type="password"
                            id="clave"
                            name="clave"
                            value={formData.clave}
                            onChange={handleChange}
                            disabled={loading || !!success}
                            placeholder="Elija una contraseña (mín. 6 caracteres)"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmarClave">Confirmar Contraseña</label>
                        <input
                            type="password"
                            id="confirmarClave"
                            name="confirmarClave"
                            value={formData.confirmarClave}
                            onChange={handleChange}
                            disabled={loading || !!success}
                            placeholder="Confirme su contraseña"
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading || !!success}
                    >
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>

                <div className="auth-links">
                    <p>
                        ¿Ya tienes una cuenta?{' '}
                        <Link to="/login" className="auth-link">Inicia sesión aquí</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegistroPage;