import { useCategorias } from '../../hooks/useCategorias';
import { Categoria } from '../../types/types';

interface CategoriaFilterProps {
    selectedCategoriaId: number | null;
    onCategoriaChange: (categoriaId: number | null) => void;
}

const CategoriaFilter = ({ selectedCategoriaId, onCategoriaChange }: CategoriaFilterProps) => {
    const { categorias, loading, error } = useCategorias();

    const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        onCategoriaChange(value ? parseInt(value) : null);
    };

    if (loading) return <p>Cargando categorías...</p>;
    if (error) return <p className="error-text">Error al cargar categorías</p>;

    return (
        <div className="categoria-filter">
            <label htmlFor="categoria-select" className="filter-label">
                Filtrar por categoría:
            </label>
            <select
                id="categoria-select"
                value={selectedCategoriaId?.toString() || ''}
                onChange={handleCategoriaChange}
                className="categoria-select"
                style={{marginLeft: '10px'}}
            >
                <option value="">Todas las categorías</option>
                {categorias.map((categoria: Categoria) => (
                    <option key={categoria.idCategoriaInstrumento} value={categoria.idCategoriaInstrumento.toString()}>
                        {categoria.denominacion}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CategoriaFilter;