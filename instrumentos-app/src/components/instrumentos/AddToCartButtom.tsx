import React, { useState } from 'react';
import { Instrumento } from '../../types/types';
import { useCarritoContext } from '../../context/CarritoContext';

interface BotonAgregarCarritoProps {
    instrumento: Instrumento;
    showQuantity?: boolean;
}

const BotonAgregarCarrito: React.FC<BotonAgregarCarritoProps> = ({
    instrumento,
    showQuantity = false
}) => {
    const { agregarAlCarrito } = useCarritoContext();
    const [cantidad, setCantidad] = useState(1);
    const [agregado, setAgregado] = useState(false);

    const handleAgregar = () => {
        agregarAlCarrito(instrumento, cantidad);
        setAgregado(true);

        setTimeout(() => {
            setAgregado(false);
        }, 1500);
    };

    const incrementar = () => {
        setCantidad(prev => prev + 1);
    };

    const decrementar = () => {
        if (cantidad > 1) {
            setCantidad(prev => prev - 1);
        }
    };

    return (
        <div className="agregar-carrito-container">
            {showQuantity && (
                <div className="quantity-selector">
                    <button
                        onClick={decrementar}
                        className="quantity-btn"
                        disabled={cantidad <= 1}
                    >
                        -
                    </button>
                    <span className="quantity">{cantidad}</span>
                    <button
                        onClick={incrementar}
                        className="quantity-btn"
                    >
                        +
                    </button>
                </div>
            )}

            <button
                className={`agregar-carrito-btn ${agregado ? 'agregado' : ''}`}
                onClick={handleAgregar}
                disabled={agregado}
            >
                {agregado ? 'Agregado ✓' : 'Agregar al carrito'}
            </button>
        </div>
    );
};

export default BotonAgregarCarrito;

//boton para agregar instrumentos al carrito.