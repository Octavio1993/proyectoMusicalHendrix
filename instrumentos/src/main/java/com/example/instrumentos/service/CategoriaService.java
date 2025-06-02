package com.example.instrumentos.service;

import com.example.instrumentos.model.CategoriaInstrumento;
import com.example.instrumentos.repository.CategoriaInstrumentoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CategoriaService {

    private final CategoriaInstrumentoRepository categoriaRepository;

    public List<CategoriaInstrumento> findAll() {
        return categoriaRepository.findAll();
    }

    public Optional<CategoriaInstrumento> findById(Long id) {
        return categoriaRepository.findById(id);
    }

    public CategoriaInstrumento save(CategoriaInstrumento categoria) {
        // Verificar si ya existe una categoría con el mismo nombre
        if (categoria.getIdCategoriaInstrumento() == null) {
            if (categoriaRepository.existsByDenominacion(categoria.getDenominacion())) {
                throw new IllegalArgumentException("Ya existe una categoría con esa denominación");
            }
        }
        return categoriaRepository.save(categoria);
    }

    public void deleteById(Long id) {
        // Verificar que la categoría existe
        CategoriaInstrumento categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));

        // Verificar que no tenga instrumentos asociados
        if (categoria.getInstrumentos() != null && !categoria.getInstrumentos().isEmpty()) {
            throw new IllegalArgumentException("No se puede eliminar una categoría con instrumentos asociados");
        }

        categoriaRepository.deleteById(id);
    }

    // Este método ahora se maneja en DataInitializer
    public void inicializarCategorias() {
        log.info("La inicialización de categorías se maneja en DataInitializer");
    }
}