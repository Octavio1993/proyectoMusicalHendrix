package com.example.instrumentos.repository;

import com.example.instrumentos.model.CategoriaInstrumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoriaInstrumentoRepository extends JpaRepository<CategoriaInstrumento, Long> {
    Optional<CategoriaInstrumento> findByDenominacion(String denominacion);
    boolean existsByDenominacion(String denominacion);
}
