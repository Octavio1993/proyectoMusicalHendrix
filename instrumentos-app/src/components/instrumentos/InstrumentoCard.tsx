import { Link } from 'react-router-dom';
import { Instrumento } from '../../types/types';
import BotonAgregarCarrito from './AddToCartButtom';

interface InstrumentoCardProps {
    instrumento: Instrumento;
}

//instrumento de forma individual en forma de tarjeta
const InstrumentoCard: React.FC<InstrumentoCardProps> = ({ instrumento }) => {
    return (
        <div className="instrumento-card">
            <div className="instrumento-img">
                <Link to={`/instrumento/${instrumento.idInstrumento || instrumento.codigo}`}>
                    <img src={`/images/${instrumento.imagen}`} alt={instrumento.denominacion} />
                </Link>
            </div>
            <div className="instrumento-info">
                <Link to={`/instrumento/${instrumento.idInstrumento || instrumento.codigo}`} className="title-link">
                    <h2 className="instrumento-title">{instrumento.denominacion}</h2>
                </Link>
                
                {/* Mostrar precio solo si está disponible */}
                {instrumento.precioActual && (
                    <p className="instrumento-precio">${instrumento.precioActual.toLocaleString()}</p>
                )}

                {/* Información del stock */}
                <p className="stock-info">
                    {instrumento.stock > 0 ? (
                        <span className="stock-disponible">
                            Stock disponible: {instrumento.stock}
                        </span>
                    ) : (
                        <span className="sin-stock">Sin stock</span>
                    )}
                </p>

                {/* Mostrar marca */}
                <p className="instrumento-marca">Marca: {instrumento.marca}</p>

                {/* Mostrar categoría */}
                <p className="instrumento-categoria">
                    Categoría: {instrumento.categoriaInstrumento.denominacion}
                </p>

                <div className="card-actions">
                    <Link 
                        to={`/instrumento/${instrumento.idInstrumento || instrumento.codigo}`} 
                        className="detalle-btn"
                    >
                        Ver Detalle
                    </Link>
                    {/* Boton para agregar al carrito - solo si hay stock */}
                    {instrumento.stock > 0 && (
                        <BotonAgregarCarrito instrumento={instrumento} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstrumentoCard;