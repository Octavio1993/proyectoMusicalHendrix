package com.example.instrumentos.repository;

import com.example.instrumentos.model.HistorialPrecioInstrumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HistorialPrecioRepository extends JpaRepository<HistorialPrecioInstrumento, Long> {
    List<HistorialPrecioInstrumento> findByInstrumento_IdInstrumentoOrderByFechaDesc(Long idInstrumento);

    @Query("SELECT h FROM HistorialPrecioInstrumento h WHERE h.instrumento.idInstrumento = :idInstrumento ORDER BY h.fecha DESC LIMIT 1")
    Optional<HistorialPrecioInstrumento> findLatestByInstrumentoId(@Param("idInstrumento") Long idInstrumento);
}