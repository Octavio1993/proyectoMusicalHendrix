import { useState, useEffect, useCallback } from 'react';
import { Categoria } from '../types/types';
import { fetchCategorias, fetchCategoriaById } from '../service/api';

export const useCategorias = () => {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    //cargo todas las categorias
    const loadCategorias = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchCategorias();
            setCategorias(data);
        } catch (err) {
            setError('Error al cargar las categorías');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    //obtengo una categoria especifica
    const getCategoriaById = async (id: number): Promise<Categoria | null> => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchCategoriaById(id);
            return data;
        } catch (err) {
            setError('Error al cargar la categoría');
            console.error(err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    //obtengo el nombre de una categoria por su ID
    const getCategoriaNameById = (id: number): string => {
        const categoria = categorias.find(cat => cat.idCategoriaInstrumento === id);
        return categoria ? categoria.denominacion : 'Categoría no encontrada';
    };

    //cargo categorias al montar el componente
    useEffect(() => {
        loadCategorias();
    }, [loadCategorias]);

    return {
        categorias,
        loading,
        error,
        getCategoriaById,
        getCategoriaNameById,
        refreshCategorias: loadCategorias
    };
};