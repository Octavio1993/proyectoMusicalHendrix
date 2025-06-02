package com.example.instrumentos.service;

import com.example.instrumentos.model.CategoriaInstrumento;
import com.example.instrumentos.model.HistorialPrecioInstrumento;
import com.example.instrumentos.model.Instrumento;
import com.example.instrumentos.repository.CategoriaInstrumentoRepository;
import com.example.instrumentos.repository.HistorialPrecioRepository;
import com.example.instrumentos.repository.InstrumentoRepository;
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
public class InstrumentoService {

    private final InstrumentoRepository instrumentoRepository;
    private final CategoriaInstrumentoRepository categoriaRepository;
    private final HistorialPrecioRepository historialPrecioRepository;

    public List<Instrumento> findAll() {
        return instrumentoRepository.findAll();
    }

    public List<Instrumento> findByCategoria(Long idCategoria) {
        return instrumentoRepository.findByCategoriaInstrumento_IdCategoriaInstrumento(idCategoria);
    }

    public Optional<Instrumento> findById(Long id) {
        return instrumentoRepository.findByIdWithHistorialPrecios(id);
    }

    public Instrumento save(Instrumento instrumento) {
        log.info("Guardando instrumento: {}", instrumento);

        // Verificar que la categoría existe
        if (instrumento.getCategoriaInstrumento() != null &&
                instrumento.getCategoriaInstrumento().getIdCategoriaInstrumento() != null) {

            CategoriaInstrumento categoria = categoriaRepository
                    .findById(instrumento.getCategoriaInstrumento().getIdCategoriaInstrumento())
                    .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));

            instrumento.setCategoriaInstrumento(categoria);
        }

        // Si es un nuevo instrumento, verificar que el código no exista
        if (instrumento.getIdInstrumento() == null) {
            if (instrumentoRepository.existsByCodigo(instrumento.getCodigo())) {
                throw new IllegalArgumentException("Ya existe un instrumento con ese código");
            }
        }

        // Guardar el instrumento
        Instrumento savedInstrumento = instrumentoRepository.save(instrumento);

        // Si se proporciona un precio y es un nuevo instrumento, crear historial de precio
        if (instrumento.getIdInstrumento() == null && instrumento.getPrecioActual() != null) {
            HistorialPrecioInstrumento historialPrecio = new HistorialPrecioInstrumento(
                    savedInstrumento,
                    instrumento.getPrecioActual()
            );
            historialPrecioRepository.save(historialPrecio);
        }

        return savedInstrumento;
    }

    public void deleteById(Long id) {
        // Verificar que el instrumento existe
        Instrumento instrumento = instrumentoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Instrumento no encontrado"));

        // Verificar que no tenga pedidos asociados
        if (instrumento.getDetallesPedido() != null && !instrumento.getDetallesPedido().isEmpty()) {
            throw new IllegalArgumentException("No se puede eliminar un instrumento con pedidos asociados");
        }

        instrumentoRepository.deleteById(id);
    }

    // Actualizar el precio de un instrumento (crea nuevo registro en historial)
    public Instrumento actualizarPrecio(Long idInstrumento, Double nuevoPrecio) {
        log.info("Actualizando precio del instrumento {} a {}", idInstrumento, nuevoPrecio);

        Instrumento instrumento = instrumentoRepository.findById(idInstrumento)
                .orElseThrow(() -> new IllegalArgumentException("Instrumento no encontrado"));

        // Crear nuevo registro en el historial de precios
        HistorialPrecioInstrumento nuevoHistorial = new HistorialPrecioInstrumento(instrumento, nuevoPrecio);
        historialPrecioRepository.save(nuevoHistorial);

        log.info("Precio actualizado correctamente");
        return instrumento;
    }

    // Actualizar stock después de una venta
    public Instrumento actualizarStock(Long idInstrumento, Integer cantidadVendida) {
        log.info("Actualizando stock del instrumento {} - Cantidad vendida: {}", idInstrumento, cantidadVendida);

        Instrumento instrumento = instrumentoRepository.findById(idInstrumento)
                .orElseThrow(() -> new IllegalArgumentException("Instrumento no encontrado"));

        Integer stockActual = instrumento.getStock();
        if (stockActual < cantidadVendida) {
            throw new IllegalArgumentException("Stock insuficiente. Stock actual: " + stockActual);
        }

        instrumento.setStock(stockActual - cantidadVendida);

        return instrumentoRepository.save(instrumento);
    }

    // Reponer stock
    public Instrumento reponerStock(Long idInstrumento, Integer cantidadReponer) {
        log.info("Reponiendo stock del instrumento {} - Cantidad: {}", idInstrumento, cantidadReponer);

        Instrumento instrumento = instrumentoRepository.findById(idInstrumento)
                .orElseThrow(() -> new IllegalArgumentException("Instrumento no encontrado"));

        instrumento.setStock(instrumento.getStock() + cantidadReponer);

        return instrumentoRepository.save(instrumento);
    }
}
