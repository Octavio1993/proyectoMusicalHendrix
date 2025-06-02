import { useState } from 'react';
import { Instrumento } from '../../types/types';
import { useCategorias } from '../../hooks/useCategorias';
import CategoriaFilter from './CategoriaFilter';
import Loading from '../common/Loading';
import Error from '../common/Error';
import './InstrumentoTable.css';

interface InstrumentoGridAdminProps {
    instrumentos: Instrumento[];
    loading: boolean;
    error: string | null;
    selectedCategoriaId: number | null;
    onFilterChange: (categoriaId: number | null) => void;
    onEdit: (instrumento: Instrumento) => void;
    onDelete: (id: string | number) => void;
    onAdd: () => void;
    onPriceUpdate?: (instrumentoId: number, nuevoPrecio: number) => void;
    onStockUpdate?: (instrumentoId: number, cantidad: number) => void;
    isAdmin?: boolean;
}

const InstrumentoGridAdmin = ({
    instrumentos,
    loading,
    error,
    selectedCategoriaId,
    onFilterChange,
    onEdit,
    onDelete,
    onAdd,
    onPriceUpdate,
    onStockUpdate,
    isAdmin = true
}: InstrumentoGridAdminProps) => {
    const { getCategoriaNameById } = useCategorias();
    const [confirmDelete, setConfirmDelete] = useState<string | number | null>(null);
    const [editingPrice, setEditingPrice] = useState<number | null>(null);
    const [editingStock, setEditingStock] = useState<number | null>(null);
    const [newPrice, setNewPrice] = useState<string>('');
    const [newStock, setNewStock] = useState<string>('');

    const handleDeleteClick = (id: string | number) => {
        if (!isAdmin) return;
        setConfirmDelete(id);
    };

    const handleConfirmDelete = (id: string | number) => {
        if (!isAdmin) return;
        onDelete(id);
        setConfirmDelete(null);
    };

    const handleCancelDelete = () => {
        setConfirmDelete(null);
    };

    //ID del instrumento
    const getInstrumentoId = (instrumento: Instrumento): string | number => {
        return instrumento.idInstrumento || instrumento.codigo;
    };

    //actualizar precio
    const handlePriceEditClick = (instrumento: Instrumento) => {
        const id = Number(instrumento.idInstrumento);
        setEditingPrice(id);
        setNewPrice(instrumento.precioActual?.toString() || '');
    };

    const handlePriceUpdate = async (instrumentoId: number) => {
        const precio = parseFloat(newPrice);
        if (isNaN(precio) || precio <= 0) {
            alert('Por favor ingrese un precio válido');
            return;
        }

        if (onPriceUpdate) {
            await onPriceUpdate(instrumentoId, precio);
        }
        
        setEditingPrice(null);
        setNewPrice('');
    };

    const handlePriceCancel = () => {
        setEditingPrice(null);
        setNewPrice('');
    };

    //actualizar stock
    const handleStockEditClick = (instrumento: Instrumento) => {
        const id = Number(instrumento.idInstrumento);
        setEditingStock(id);
        setNewStock('');
    };

    const handleStockUpdate = async (instrumentoId: number) => {
        const cantidad = parseInt(newStock);
        if (isNaN(cantidad) || cantidad <= 0) {
            alert('Por favor ingrese una cantidad válida mayor a 0');
            return;
        }

        if (onStockUpdate) {
            await onStockUpdate(instrumentoId, cantidad);
        }
        
        setEditingStock(null);
        setNewStock('');
    };

    const handleStockCancel = () => {
        setEditingStock(null);
        setNewStock('');
    };

    if (loading) return <Loading />;
    if (error) return <Error message={error} />;

    return (
        <div className="instrumento-grid-admin" style={{ marginTop: '10px' }}>
            <div className="admin-header">
                <h2>Administración de Instrumentos</h2>
                <div className="admin-actions" style={{ marginTop: '10px' }}>
                    {isAdmin && (
                        <button
                            className="btn btn-primary add-btn"
                            onClick={onAdd}
                            style={{ marginBottom: '20px' }}
                        >
                            Agregar Instrumento
                        </button>
                    )}
                    <CategoriaFilter
                        selectedCategoriaId={selectedCategoriaId}
                        onCategoriaChange={onFilterChange}
                    />
                </div>
            </div>

            {instrumentos.length === 0 ? (
                <div className="no-data">
                    {selectedCategoriaId
                        ? "No hay instrumentos en esta categoría"
                        : "No hay instrumentos disponibles"}
                </div>
            ) : (
                <div className="table-responsive" style={{ marginTop: '20px' }}>
                    <table className="instrumento-table">
                        <thead>
                            <tr>
                                <th>Imagen</th>
                                <th>Código</th>
                                <th>Instrumento</th>
                                <th>Marca</th>
                                <th>Categoría</th>
                                <th>Precio</th>
                                <th>Stock</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {instrumentos.map(instrumento => {
                                const instrumentoId = getInstrumentoId(instrumento);
                                const numericId = Number(instrumento.idInstrumento);
                                
                                return (
                                    <tr key={instrumentoId}>
                                        <td className="img-cell" data-label="Imagen">
                                            <img
                                                src={`/images/${instrumento.imagen}`}
                                                alt={instrumento.denominacion}
                                                className="table-img"
                                            />
                                        </td>
                                        <td data-label="Código">{instrumento.codigo}</td>
                                        <td data-label="Instrumento">{instrumento.denominacion}</td>
                                        <td data-label="Marca">{instrumento.marca}</td>
                                        <td data-label="Categoría">{instrumento.categoriaInstrumento.denominacion}</td>
                                        <td className="price-cell" data-label="Precio">
                                            {editingPrice === numericId ? (
                                                <div className="price-edit">
                                                    <input
                                                        type="number"
                                                        value={newPrice}
                                                        onChange={(e) => setNewPrice(e.target.value)}
                                                        placeholder="Nuevo precio"
                                                        style={{ width: '100px', marginRight: '5px' }}
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                    <button
                                                        onClick={() => handlePriceUpdate(numericId)}
                                                        className="btn btn-sm btn-success"
                                                        style={{ marginRight: '2px' }}
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        onClick={handlePriceCancel}
                                                        className="btn btn-sm btn-secondary"
                                                    >
                                                        ✗
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="price-display">
                                                    <span>
                                                        {instrumento.precioActual ? `$${instrumento.precioActual.toLocaleString()}` : 'No definido'}
                                                    </span>
                                                    {onPriceUpdate && (
                                                        <button
                                                            onClick={() => handlePriceEditClick(instrumento)}
                                                            className="btn btn-sm btn-outline"
                                                            style={{ marginLeft: '5px' }}
                                                            title="Actualizar precio"
                                                        >
                                                            💰
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className={`centered ${instrumento.stock === 0 ? 'no-stock' : ''}`} data-label="Stock">
                                            {editingStock === numericId ? (
                                                <div className="stock-edit">
                                                    <input
                                                        type="number"
                                                        value={newStock}
                                                        onChange={(e) => setNewStock(e.target.value)}
                                                        placeholder="Cantidad"
                                                        style={{ width: '80px', marginRight: '5px' }}
                                                        min="1"
                                                    />
                                                    <button
                                                        onClick={() => handleStockUpdate(numericId)}
                                                        className="btn btn-sm btn-success"
                                                        style={{ marginRight: '2px' }}
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        onClick={handleStockCancel}
                                                        className="btn btn-sm btn-secondary"
                                                    >
                                                        ✗
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="stock-display">
                                                    <span>{instrumento.stock}</span>
                                                    {onStockUpdate && (
                                                        <button
                                                            onClick={() => handleStockEditClick(instrumento)}
                                                            className="btn btn-sm btn-outline"
                                                            style={{ marginLeft: '5px' }}
                                                            title="Reponer stock"
                                                        >
                                                            📦
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="actions-cell" data-label="Acciones">
                                            {confirmDelete === instrumentoId ? (
                                                <div className="confirm-delete">
                                                    <span>¿Eliminar?</span>
                                                    <button
                                                        onClick={() => handleConfirmDelete(instrumentoId)}
                                                        className="btn btn-danger btn-sm"
                                                    >
                                                        Sí
                                                    </button>
                                                    <button
                                                        onClick={handleCancelDelete}
                                                        className="btn btn-secondary btn-sm"
                                                    >
                                                        No
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => onEdit(instrumento)}
                                                        className="btn btn-outline btn-sm edit-btn"
                                                        title="Editar"
                                                    >
                                                        ✏️ Editar
                                                    </button>

                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => handleDeleteClick(instrumentoId)}
                                                            className="btn btn-outline btn-sm delete-btn"
                                                            title="Eliminar"
                                                        >
                                                            🗑️ Eliminar
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default InstrumentoGridAdmin;