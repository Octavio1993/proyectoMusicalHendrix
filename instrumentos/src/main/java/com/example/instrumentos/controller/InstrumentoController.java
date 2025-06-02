package com.example.instrumentos.controller;

import com.example.instrumentos.model.CategoriaInstrumento;
import com.example.instrumentos.model.Instrumento;
import com.example.instrumentos.service.InstrumentoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/instrumentos")
@RequiredArgsConstructor
@Slf4j
public class InstrumentoController {

    private final InstrumentoService instrumentoService;

    @GetMapping
    public ResponseEntity<List<Instrumento>> getAllInstrumentos(
            @RequestParam(required = false) Long idCategoria) {

        List<Instrumento> instrumentos;
        if (idCategoria != null) {
            instrumentos = instrumentoService.findByCategoria(idCategoria);
        } else {
            instrumentos = instrumentoService.findAll();
        }

        return ResponseEntity.ok(instrumentos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Instrumento> getInstrumentoById(@PathVariable Long id) {
        return instrumentoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createInstrumento(@RequestBody Instrumento instrumento) {
        try {
            return new ResponseEntity<>(instrumentoService.save(instrumento), HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateInstrumento(@PathVariable Long id, @RequestBody Map<String, Object> requestBody) {
        try {
            log.info("Actualizando instrumento con ID: {}", id);
            log.info("Datos recibidos: {}", requestBody);

            return instrumentoService.findById(id)
                    .map(existingInstrumento -> {
                        // Actualizar campos básicos
                        if (requestBody.containsKey("codigo")) {
                            existingInstrumento.setCodigo((String) requestBody.get("codigo"));
                        }
                        if (requestBody.containsKey("denominacion")) {
                            existingInstrumento.setDenominacion((String) requestBody.get("denominacion"));
                        }
                        if (requestBody.containsKey("marca")) {
                            existingInstrumento.setMarca((String) requestBody.get("marca"));
                        }
                        if (requestBody.containsKey("stock")) {
                            existingInstrumento.setStock(((Number) requestBody.get("stock")).intValue());
                        }
                        if (requestBody.containsKey("descripcion")) {
                            existingInstrumento.setDescripcion((String) requestBody.get("descripcion"));
                        }
                        if (requestBody.containsKey("imagen")) {
                            existingInstrumento.setImagen((String) requestBody.get("imagen"));
                        }

                        // Manejar la categoría - ESTA ES LA PARTE IMPORTANTE
                        if (requestBody.containsKey("categoriaId")) {
                            Long categoriaId = ((Number) requestBody.get("categoriaId")).longValue();
                            log.info("Asignando categoría con ID: {}", categoriaId);

                            // Crear el objeto CategoriaInstrumento con solo el ID
                            CategoriaInstrumento categoria = new CategoriaInstrumento();
                            categoria.setIdCategoriaInstrumento(categoriaId);
                            existingInstrumento.setCategoriaInstrumento(categoria);
                        }

                        Instrumento updated = instrumentoService.save(existingInstrumento);
                        log.info("Instrumento actualizado correctamente: {}", updated);
                        return ResponseEntity.ok(updated);
                    })
                    .orElseGet(() -> {
                        log.error("Instrumento no encontrado con ID: {}", id);
                        return ResponseEntity.notFound().build();
                    });
        } catch (Exception e) {
            log.error("Error al actualizar instrumento: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInstrumento(@PathVariable Long id) {
        try {
            instrumentoService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    //actualizar precio
    @PatchMapping("/{id}/precio")
    public ResponseEntity<?> updatePrecio(@PathVariable Long id, @RequestBody Map<String, Double> body) {
        try {
            Double nuevoPrecio = body.get("precio");
            if (nuevoPrecio == null || nuevoPrecio <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Precio inválido"));
            }

            Instrumento actualizado = instrumentoService.actualizarPrecio(id, nuevoPrecio);
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    //reponer stock
    @PatchMapping("/{id}/stock")
    public ResponseEntity<?> updateStock(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        try {
            Integer cantidad = body.get("cantidad");
            if (cantidad == null || cantidad <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cantidad inválida"));
            }

            Instrumento actualizado = instrumentoService.reponerStock(id, cantidad);
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}