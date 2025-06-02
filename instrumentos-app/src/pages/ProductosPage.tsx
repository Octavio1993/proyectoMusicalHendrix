import { useState, useEffect } from 'react';
import InstrumentosList from '../components/instrumentos/InstumentosList';
import CategoriaFilter from '../components/instrumentos/CategoriaFilter';
import { useInstrumentos } from '../hooks/useInstrumentos';

const ProductosPage = () => {
  const {
    instrumentos,
    loading,
    error,
    selectedCategoriaId,
    filterByCategoria,
    refreshInstrumentos
  } = useInstrumentos();

  useEffect(() => {
    const paymentSuccess = localStorage.getItem('payment_success');
    
    if (paymentSuccess === 'true') {
      console.log('Detectado pago exitoso en ProductosPage, recargando página...');
      localStorage.removeItem('payment_success');
      
      window.location.reload();
    }
  }, [refreshInstrumentos]);

  return (
    <div className="productos-page">
      <div className="page-header">
        <h1>Nuestros Productos</h1>
        <p>Explora nuestra amplia selección de instrumentos musicales de alta calidad</p>
      </div>
      
      <div className="filter-container">
        <CategoriaFilter
          selectedCategoriaId={selectedCategoriaId}
          onCategoriaChange={filterByCategoria}
        />
      </div>
      
      <div className="productos-container">
        <InstrumentosList
          instrumentos={instrumentos}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default ProductosPage;