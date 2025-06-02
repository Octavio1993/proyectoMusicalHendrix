import { useState, useEffect } from 'react';
import { Instrumento } from '../../types/types';
import { useCategorias } from '../../hooks/useCategorias';
import './InstrumentoForm.css';

interface InstrumentoFormProps {
    instrumento?: Instrumento;
    onSubmit: (data: Omit<Instrumento, 'idInstrumento'>) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}

const defaultInstrumento: Omit<Instrumento, 'idInstrumento'> = {
    codigo: '',
    denominacion: '',
    marca: '',
    stock: 0,
    descripcion: '',
    imagen: '',
    precioActual: 0,
    categoriaInstrumento: {
        idCategoriaInstrumento: 0,
        denominacion: ''
    }
};

const InstrumentoForm = ({
    instrumento,
    onSubmit,
    onCancel,
    isSubmitting
}: InstrumentoFormProps) => {
    const { categorias, loading: loadingCategorias } = useCategorias();
    const [formData, setFormData] = useState<Omit<Instrumento, 'idInstrumento'>>(
        instrumento ? {
            codigo: instrumento.codigo,
            denominacion: instrumento.denominacion,
            marca: instrumento.marca,
            stock: instrumento.stock,
            descripcion: instrumento.descripcion,
            imagen: instrumento.imagen,
            precioActual: instrumento.precioActual || 0,
            categoriaInstrumento: instrumento.categoriaInstrumento
        } : defaultInstrumento
    );
    const [errors, setErrors] = useState<Record<string, string>>({});

    //actualiza el formData cuando cambia instrumento
    useEffect(() => {
        if (instrumento) {
            setFormData({
                codigo: instrumento.codigo,
                denominacion: instrumento.denominacion,
                marca: instrumento.marca,
                stock: instrumento.stock,
                descripcion: instrumento.descripcion,
                imagen: instrumento.imagen,
                precioActual: instrumento.precioActual || 0,
                categoriaInstrumento: instrumento.categoriaInstrumento
            });
        }
    }, [instrumento]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        let parsedValue: string | number = value;

        if ((name === 'precioActual' || name === 'stock') && type === 'number') {
            parsedValue = value === '' ? 0 : parseFloat(value);
        }

        if (name === 'idCategoriaInstrumento') {
            const categoriaId = parseInt(value);
            const categoria = categorias.find(cat => cat.idCategoriaInstrumento === categoriaId);
            
            setFormData(prevData => ({
                ...prevData,
                categoriaInstrumento: {
                    idCategoriaInstrumento: categoriaId,
                    denominacion: categoria?.denominacion || ''
                }
            }));
        } else {
            setFormData(prevData => ({
                ...prevData,
                [name]: parsedValue
            }));
        }

        //limpia el error al cambiar el valor
        if (errors[name]) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [name]: ''
            }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        //valida los campos obligatorios
        if (!formData.codigo.trim()) {
            newErrors.codigo = 'El código del instrumento es obligatorio';
        }

        if (!formData.denominacion.trim()) {
            newErrors.denominacion = 'La denominación del instrumento es obligatoria';
        }

        if (!formData.marca.trim()) {
            newErrors.marca = 'La marca es obligatoria';
        }

        if (!formData.imagen.trim()) {
            newErrors.imagen = 'La imagen es obligatoria';
        }

        if ((formData.precioActual || 0) <= 0) {
            newErrors.precioActual = 'El precio debe ser mayor que cero';
        }

        if (formData.stock < 0) {
            newErrors.stock = 'El stock no puede ser negativo';
        }

        if (!formData.descripcion.trim()) {
            newErrors.descripcion = 'La descripción es obligatoria';
        }

        if (!formData.categoriaInstrumento.idCategoriaInstrumento) {
            newErrors.idCategoriaInstrumento = 'Debe seleccionar una categoría';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (validate()) {
            try {
                console.log('Enviando formulario:', formData);
                await onSubmit(formData);
            } catch (error) {
                console.error('Error al enviar formulario:', error);
                alert('Error al guardar el instrumento. Intente nuevamente.');
            }
        }
    };

    return (
        <div className="instrumento-form-container">
            <form className="instrumento-form" onSubmit={handleSubmit}>
                <h2 className="form-title">
                    {instrumento ? 'Editar Instrumento' : 'Nuevo Instrumento'}
                </h2>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="codigo">Código</label>
                        <input
                            type="text"
                            id="codigo"
                            name="codigo"
                            value={formData.codigo}
                            onChange={handleChange}
                            className={errors.codigo ? 'error' : ''}
                            disabled={isSubmitting}
                            placeholder="Código único del instrumento"
                        />
                        {errors.codigo && <span className="error-text">{errors.codigo}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="denominacion">Denominación</label>
                        <input
                            type="text"
                            id="denominacion"
                            name="denominacion"
                            value={formData.denominacion}
                            onChange={handleChange}
                            className={errors.denominacion ? 'error' : ''}
                            disabled={isSubmitting}
                        />
                        {errors.denominacion && <span className="error-text">{errors.denominacion}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="marca">Marca</label>
                        <input
                            type="text"
                            id="marca"
                            name="marca"
                            value={formData.marca}
                            onChange={handleChange}
                            className={errors.marca ? 'error' : ''}
                            disabled={isSubmitting}
                        />
                        {errors.marca && <span className="error-text">{errors.marca}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="idCategoriaInstrumento">Categoría</label>
                        <select
                            id="idCategoriaInstrumento"
                            name="idCategoriaInstrumento"
                            value={formData.categoriaInstrumento.idCategoriaInstrumento}
                            onChange={handleChange}
                            className={errors.idCategoriaInstrumento ? 'error' : ''}
                            disabled={isSubmitting || loadingCategorias}
                        >
                            <option value="">Seleccione una categoría</option>
                            {categorias.map(categoria => (
                                <option key={categoria.idCategoriaInstrumento} value={categoria.idCategoriaInstrumento}>
                                    {categoria.denominacion}
                                </option>
                            ))}
                        </select>
                        {errors.idCategoriaInstrumento && <span className="error-text">{errors.idCategoriaInstrumento}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="precioActual">Precio</label>
                        <input
                            type="number"
                            id="precioActual"
                            name="precioActual"
                            min="0"
                            step="0.01"
                            value={formData.precioActual || ''}
                            onChange={handleChange}
                            className={errors.precioActual ? 'error' : ''}
                            disabled={isSubmitting}
                        />
                        {errors.precioActual && <span className="error-text">{errors.precioActual}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="stock">Stock</label>
                        <input
                            type="number"
                            id="stock"
                            name="stock"
                            min="0"
                            value={formData.stock}
                            onChange={handleChange}
                            className={errors.stock ? 'error' : ''}
                            disabled={isSubmitting}
                        />
                        {errors.stock && <span className="error-text">{errors.stock}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="imagen">Imagen</label>
                        <input
                            type="text"
                            id="imagen"
                            name="imagen"
                            value={formData.imagen}
                            onChange={handleChange}
                            className={errors.imagen ? 'error' : ''}
                            disabled={isSubmitting}
                            placeholder="Ejemplo: nro1.jpg"
                        />
                        {errors.imagen && <span className="error-text">{errors.imagen}</span>}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="descripcion">Descripción</label>
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        rows={5}
                        className={errors.descripcion ? 'error' : ''}
                        disabled={isSubmitting}
                    ></textarea>
                    {errors.descripcion && <span className="error-text">{errors.descripcion}</span>}
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Guardando...' : instrumento ? 'Actualizar' : 'Crear'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InstrumentoForm;