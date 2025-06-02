import React from 'react';
import { useCarritoContext } from '../../context/CarritoContext';

const CarritoIcon: React.FC = () => {
    const { totalItems, toggleCarrito } = useCarritoContext();

    return (
        <div className="carrito-icon" onClick={toggleCarrito}>
            <span className="icon">🛒</span>
            {totalItems > 0 && (
                <span className="badge">{totalItems}</span>
            )}
        </div>
    );
};

export default CarritoIcon;

//Muestra el numero de items en el carrito.