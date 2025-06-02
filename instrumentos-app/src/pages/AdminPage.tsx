import { useState, useEffect } from 'react';
import { Instrumento, FormState } from '../types/types';
import { useInstrumentos } from '../hooks/useInstrumentos';
import { updateInstrumentPrice, updateInstrumentStock } from '../service/api';
import InstrumentoGridAdmin from '../components/instrumentos/InstrumentoGridAdmin';
import InstrumentoForm from '../components/instrumentos/InstrumentoForm';
import Loading from '../components/common/Loading';
import Error from '../components/common/Error';
import { useAuth } from '../context/AuthContext';
import { UserRol } from '../types/auth';

const AdminPage = () => {
    const {
        instrumentos,
        loading,
        error,
        selectedCategoriaId,
        filterByCategoria,
        addInstrumento,
        editInstrumento,
        removeInstrumento,
        refreshInstrumentos 
    } = useInstrumentos();

    const { user } = useAuth();
    
    //funcion auxiliar para obtener el rol como string
    const getUserRol = () => {
        if (!user?.rol) return '';
        if (typeof user.rol === 'object' && 'definicion' in user.rol) {
            return user.rol.definicion;
        }
        return user.rol as string;
    };

    const userRol = getUserRol();
    const isAdmin = userRol === UserRol.ADMIN;
    const isOperador = userRol === UserRol.OPERADOR;

    const [showForm, setShowForm] = useState<boolean>(false);
    const [currentInstrumento, setCurrentInstrumento] = useState<Instrumento | undefined>(undefined);
    const [formState, setFormState] = useState<FormState>({
        isSubmitting: false,
        isSuccess: false,
        isError: false,
        message: ''
    });

    //formulario para crear nuevo instrumento (solo admin)
    const handleAdd = () => {
        if (!isAdmin) return;

        setCurrentInstrumento(undefined);
        setShowForm(true);
        setFormState({
            isSubmitting: false,
            isSuccess: false,
            isError: false,
            message: ''
        });
    };

    //formulario para editar instrumento existente (admin y operador)
    const handleEdit = (instrumento: Instrumento) => {
        setCurrentInstrumento(instrumento);
        setShowForm(true);
        setFormState({
            isSubmitting: false,
            isSuccess: false,
            isError: false,
            message: ''
        });
    };

    //cerrar el formulario
    const handleCancel = () => {
        setShowForm(false);
    };

    //guardar el instrumento (crear o actualizar)
    const handleSubmit = async (data: Omit<Instrumento, 'idInstrumento'>) => {
        setFormState(prev => ({ ...prev, isSubmitting: true, isError: false, message: '' }));

        try {
            console.log('Datos recibidos en AdminPage:', data);
            console.log('Instrumento actual:', currentInstrumento);

            if (currentInstrumento) {
                //usa idInstrumento o codigo como ID
                const instrumentoId = currentInstrumento.idInstrumento || currentInstrumento.codigo;
                console.log('Actualizando instrumento con ID:', instrumentoId);
                const result = await editInstrumento(instrumentoId.toString(), data);
                console.log('Resultado de actualización:', result);

                setFormState({
                    isSubmitting: false,
                    isSuccess: true,
                    isError: false,
                    message: 'Instrumento actualizado correctamente'
                });
            } else if (isAdmin) {
                //admin puede crear nuevos instrumentos
                await addInstrumento(data);
                setFormState({
                    isSubmitting: false,
                    isSuccess: true,
                    isError: false,
                    message: 'Instrumento creado correctamente'
                });
            }

            setTimeout(() => {
                setShowForm(false);
            }, 1500);

        } catch (error) {
            console.error('Error completo en handleSubmit:', error);
            setFormState({
                isSubmitting: false,
                isSuccess: false,
                isError: true,
                message: 'Error al guardar el instrumento'
            });
        }
    };

    //eliminar un instrumento (solo admin)
    const handleDelete = async (id: string | number) => {
        if (!isAdmin) return;
        await removeInstrumento(id.toString());
    };

    //funcion para actualizar precio especifico
    const handlePriceUpdate = async (instrumentoId: number, nuevoPrecio: number) => {
        try {
            console.log(`Actualizando precio del instrumento ${instrumentoId} a ${nuevoPrecio}`);
            
            //usa la funcion especifica para actualizar precio
            await updateInstrumentPrice(instrumentoId, nuevoPrecio);
            
            //recargar la lista de instrumentos
            if (refreshInstrumentos) {
                await refreshInstrumentos(true);
            } else {
                window.location.reload();
            }
            
            setFormState({
                isSubmitting: false,
                isSuccess: true,
                isError: false,
                message: 'Precio actualizado correctamente'
            });
            
            setTimeout(() => {
                setFormState(prev => ({ ...prev, isSuccess: false, message: '' }));
            }, 3000);
            
        } catch (error) {
            console.error('Error actualizando precio:', error);
            setFormState({
                isSubmitting: false,
                isSuccess: false,
                isError: true,
                message: 'Error al actualizar el precio'
            });
            
            setTimeout(() => {
                setFormState(prev => ({ ...prev, isError: false, message: '' }));
            }, 5000);
        }
    };

    //actualizar stock especifico
    const handleStockUpdate = async (instrumentoId: number, cantidad: number) => {
        try {
            console.log(`Actualizando stock del instrumento ${instrumentoId} - cantidad: ${cantidad}`);
            
            //funcion especifica para actualizar stock
            await updateInstrumentStock(instrumentoId, cantidad);
            
            //recargar la lista de instrumentos
            if (refreshInstrumentos) {
                await refreshInstrumentos(true);
            } else {
                window.location.reload();
            }
            
            setFormState({
                isSubmitting: false,
                isSuccess: true,
                isError: false,
                message: 'Stock actualizado correctamente'
            });
            
            setTimeout(() => {
                setFormState(prev => ({ ...prev, isSuccess: false, message: '' }));
            }, 3000);
            
        } catch (error) {
            console.error('Error actualizando stock:', error);
            setFormState({
                isSubmitting: false,
                isSuccess: false,
                isError: true,
                message: 'Error al actualizar el stock'
            });
            
            setTimeout(() => {
                setFormState(prev => ({ ...prev, isError: false, message: '' }));
            }, 5000);
        }
    };

    if (loading && instrumentos.length === 0) return <Loading />;
    if (error && !showForm) return <Error message={error} />;

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>Panel de Administración</h1>
                <p>
                    {isAdmin
                        ? "Gestiona los instrumentos musicales de la tienda"
                        : "Visualiza y edita instrumentos musicales de la tienda"}
                </p>

                {isOperador && (
                    <div className="role-info" style={{ marginTop: '10px', color: '#666' }}>
                        <p>Como operador, puedes editar instrumentos pero no crear nuevos ni eliminarlos.</p>
                    </div>
                )}
            </div>

            {formState.isSuccess && (
                <div className="alert alert-success">
                    {formState.message}
                </div>
            )}

            {formState.isError && (
                <div className="alert alert-error">
                    {formState.message}
                </div>
            )}

            {showForm ? (
                <div className="form-container" style={{ marginTop: '20px' }}>
                    <InstrumentoForm
                        instrumento={currentInstrumento}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        isSubmitting={formState.isSubmitting}
                    />
                </div>
            ) : (
                <InstrumentoGridAdmin
                    instrumentos={instrumentos}
                    loading={loading}
                    error={error}
                    selectedCategoriaId={selectedCategoriaId}
                    onFilterChange={filterByCategoria}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAdd={handleAdd}
                    onPriceUpdate={handlePriceUpdate}
                    onStockUpdate={handleStockUpdate}
                    isAdmin={isAdmin}
                />
            )}
        </div>
    );
};

export default AdminPage;