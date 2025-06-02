import { useState, useEffect, useCallback } from 'react';
import { Instrumento } from '../types/types';
import {
    fetchInstrumentos,
    fetchInstrumentosByCategoria,
    fetchInstrumentoById,
    createInstrumento,
    updateInstrumento,
    deleteInstrumento
} from '../service/api';

export const useInstrumentos = () => {
    const [instrumentos, setInstrumentos] = useState<Instrumento[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | null>(null);
    const [refreshCounter, setRefreshCounter] = useState(0);

    //carga los instrumentos al iniciar
    const loadInstrumentos = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            let data: Instrumento[];

            if (selectedCategoriaId) {
                data = await fetchInstrumentosByCategoria(selectedCategoriaId);
            } else {
                data = await fetchInstrumentos();
            }

            setInstrumentos(data);
        } catch (err) {
            setError('Error al cargar los instrumentos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [selectedCategoriaId, refreshCounter]);

    //filtra los instrumentos por categoria
    const filterByCategoria = (categoriaId: number | null) => {
        setSelectedCategoriaId(categoriaId);
    };

    //metodo para refrescar los instrumentos
    const refreshInstrumentos = useCallback((forceRefresh = false) => {
        if (forceRefresh) {
            console.log('Forzando actualización de instrumentos');
            setRefreshCounter(prev => prev + 1);
        } else {
            loadInstrumentos();
        }
    }, [loadInstrumentos]);

    //instrumento por ID
    const getInstrumentoById = async (id: string): Promise<Instrumento | null> => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchInstrumentoById(id);
            return data;
        } catch (err) {
            setError('Error al cargar el instrumento');
            console.error(err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    //nuevo instrumento
    const addInstrumento = async (instrumento: Omit<Instrumento, 'id'>): Promise<Instrumento | null> => {
        try {
            setLoading(true);
            setError(null);
            const newInstrumento = await createInstrumento(instrumento);
            refreshInstrumentos(true);
            return newInstrumento;
        } catch (err) {
            setError('Error al crear el instrumento');
            console.error(err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    //actualizo un instrumento
    const editInstrumento = async (id: string, instrumento: Omit<Instrumento, 'id'>): Promise<Instrumento | null> => {
        try {
            setLoading(true);
            setError(null);

            console.log('Editando instrumento con ID:', id);
            console.log('Datos a enviar:', instrumento);

            const updatedInstrumento = await updateInstrumento(id, instrumento);

            setInstrumentos(prevInstrumentos =>
                prevInstrumentos.map(item =>
                    item.idInstrumento?.toString() === id ? { ...item, ...instrumento, id } : item
                )
            );

            refreshInstrumentos(true);

            return updatedInstrumento;
        } catch (err) {
            console.error('Error en editInstrumento:', err);
            setError('Error al actualizar el instrumento');
            return null;
        } finally {
            setLoading(false);
        }
    };

    //elimina un instrumento
    const removeInstrumento = async (id: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            await deleteInstrumento(id);
            refreshInstrumentos(true);
            return true;
        } catch (err) {
            setError('Error al eliminar el instrumento');
            console.error(err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    //carga los instrumentos al iniciar
    useEffect(() => {
        loadInstrumentos();
    }, [loadInstrumentos]);

    useEffect(() => {
        const paymentSuccess = localStorage.getItem('payment_success');

        if (paymentSuccess === 'true') {
            console.log('Detectado pago exitoso, actualizando instrumentos...');
            refreshInstrumentos(true);
            localStorage.removeItem('payment_success');
        }
    }, [refreshInstrumentos]);

    return {
        instrumentos,
        loading,
        error,
        selectedCategoriaId,
        filterByCategoria,
        getInstrumentoById,
        addInstrumento,
        editInstrumento,
        removeInstrumento,
        refreshInstrumentos
    };
};