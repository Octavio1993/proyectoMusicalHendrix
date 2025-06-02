import { useState, useEffect } from 'react';
import { adminUserService } from '../service/adminUserService';
import { UserRol } from '../types/auth';
import Loading from '../components/common/Loading';
import Error from '../components/common/Error';
import './AuthPages.css';

interface Usuario {
    id?: number;
    idUsuario?: number;
    nombreUsuario?: string;
    email?: string;
    nombre?: string;
    apellido?: string;
    rol: string | {
        idRol: number;
        definicion: string;
    };
}

const getErrorMessage = (error: any): string => {
  if (error) {
    if (typeof error === 'string') {
      return error;
    }
    if (error.message) {
      return error.message;
    }
  }
  return 'Ocurrió un error desconocido';
};

//funcion para obtener el ID del usuario
const getUserId = (usuario: Usuario): number => {
    return usuario.id || usuario.idUsuario || 0;
};

const GestionUsuariosPage = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        clave: '',
        confirmarClave: ''
    });

    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    //carga de usuarios
    useEffect(() => {
        loadUsuarios();
    }, []);

    //funcion para cargar usuarios
    const loadUsuarios = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await adminUserService.getAllUsers();
            console.log('Usuarios recibidos del backend:', data); // DEBUG
            console.log('Cantidad de usuarios:', data.length); // DEBUG
            setUsuarios(data);
        } catch (error: unknown) {
            setError(getErrorMessage(error) || 'Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    //manejar cambios en el formulario
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formError) setFormError(null);
    };

    //manejar envio del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nombre || !formData.apellido || !formData.email || !formData.clave || !formData.confirmarClave) {
            setFormError('Por favor complete todos los campos');
            return;
        }

        if (formData.clave !== formData.confirmarClave) {
            setFormError('Las contraseñas no coinciden');
            return;
        }

        if (formData.clave.length < 6) {
            setFormError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        //validar formato de email basico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setFormError('Por favor ingrese un email válido');
            return;
        }

        try {
            setFormSubmitting(true);
            setFormError(null);

            //registro de operador con la estructura correcta
            await adminUserService.registerOperador({
                nombre: formData.nombre,
                apellido: formData.apellido,
                email: formData.email,
                clave: formData.clave,
                rol: UserRol.OPERADOR
            });

            setFormData({
                nombre: '',
                apellido: '',
                email: '',
                clave: '',
                confirmarClave: ''
            });

            setSuccess('Operador registrado exitosamente');
            setShowForm(false);

            //recarga lista de usuarios
            loadUsuarios();

            setTimeout(() => {
                setSuccess(null);
            }, 3000);

        } catch (error: unknown) {
            setFormError(getErrorMessage(error) || 'Error al registrar operador');
        } finally {
            setFormSubmitting(false);
        }
    };

    //eliminar usuario
    const handleDeleteUser = async (userId: number) => {
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

        try {
            setLoading(true);
            await adminUserService.deleteUser(userId);

            setUsuarios(prev => prev.filter(user => {
                const currentUserId = getUserId(user);
                return currentUserId !== userId;
            }));

            setSuccess('Usuario eliminado exitosamente');

            setTimeout(() => {
                setSuccess(null);
            }, 3000);

        } catch (error: unknown) {
            setError(getErrorMessage(error) || 'Error al eliminar usuario');
        } finally {
            setLoading(false);
        }
    };

    if (loading && usuarios.length === 0) return <Loading />;

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>Gestión de Usuarios</h1>
                <p>Administración de usuarios y operadores del sistema</p>
            </div>

            {error && <Error message={error} />}

            {success && (
                <div className="auth-success" style={{ marginBottom: '20px' }}>
                    {success}
                </div>
            )}

            <div className="admin-actions" style={{ marginBottom: '20px' }}>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancelar' : 'Registrar Nuevo Operador'}
                </button>
            </div>

            {showForm && (
                <div className="auth-container" style={{ maxWidth: '600px', margin: '0 auto 30px' }}>
                    <h2 className="auth-title">Registrar Nuevo Operador</h2>

                    {formError && (
                        <div className="auth-error">
                            {formError}
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
                                disabled={formSubmitting}
                                placeholder="Ingrese el nombre"
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
                                disabled={formSubmitting}
                                placeholder="Ingrese el apellido"
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
                                disabled={formSubmitting}
                                placeholder="Ingrese el email"
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
                                disabled={formSubmitting}
                                placeholder="Ingrese contraseña (mín. 6 caracteres)"
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
                                disabled={formSubmitting}
                                placeholder="Confirme la contraseña"
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={formSubmitting}
                        >
                            {formSubmitting ? 'Registrando...' : 'Registrar Operador'}
                        </button>
                    </form>
                </div>
            )}

            <div className="users-list">
                <h2>Usuarios del Sistema</h2>

                {usuarios.length === 0 ? (
                    <p>No hay usuarios registrados</p>
                ) : (
                    <div className="table-responsive">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Usuario</th>
                                    <th>Rol</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.length > 0 ? (
                                    usuarios.map(usuario => {
                                        console.log('Renderizando usuario:', usuario); // DEBUG
                                        const userId = getUserId(usuario);
                                        return (
                                            <tr key={userId}>
                                                <td>{userId}</td>
                                                <td>{usuario.nombreUsuario || usuario.email || `${usuario.nombre} ${usuario.apellido}`}</td>
                                                <td>
                                                    <span className={`role-badge ${typeof usuario.rol === 'string' ? usuario.rol.toLowerCase() : usuario.rol.definicion?.toLowerCase() || 'visor'}`}>
                                                        {typeof usuario.rol === 'string' ? usuario.rol : usuario.rol.definicion || 'Visor'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {/* Solo permitir eliminar si NO es Admin */}
                                                    {(typeof usuario.rol === 'string' ? usuario.rol : usuario.rol.definicion) !== 'Admin' && (
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleDeleteUser(userId)}
                                                        >
                                                            Eliminar
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center' }}>
                                            No hay usuarios para mostrar
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GestionUsuariosPage;