package com.example.instrumentos.controller;

import com.example.instrumentos.model.Pedido;
import com.example.instrumentos.model.Usuario;
import com.example.instrumentos.service.PedidoService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pedidos")
@RequiredArgsConstructor
@Slf4j
public class PedidoController {

    private final PedidoService pedidoService;

    //todos los pedidos
    @GetMapping
    public ResponseEntity<List<Pedido>> getAllPedidos() {
        return ResponseEntity.ok(pedidoService.findAll());
    }

    //pedidos por usuario
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Pedido>> getPedidosByUsuario(@PathVariable Long usuarioId) {
        List<Pedido> pedidos = pedidoService.findByUsuarioId(usuarioId);
        return ResponseEntity.ok(pedidos);
    }

    //pedido por ID
    @GetMapping("/{id}")
    public ResponseEntity<Pedido> getPedidoById(@PathVariable Long id) {
        return pedidoService.findById(id)
                .map(pedido -> ResponseEntity.ok(pedidoService.enrichPedidoWithInstrumentos(pedido)))
                .orElse(ResponseEntity.notFound().build());
    }

    //crear nuevo pedido
    @PostMapping
    public ResponseEntity<?> createPedido(
            @RequestBody Pedido pedido,
            HttpServletRequest request) {
        try {
            log.info("Recibiendo pedido: {}", pedido);

            //ID de usuario del header o atributo
            String userIdHeader = request.getHeader("X-User-Id");
            Object userIdAttribute = request.getAttribute("usuarioId");

            Long userId = null;

            //ID del header primero
            if (userIdHeader != null && !userIdHeader.isEmpty()) {
                try {
                    userId = Long.parseLong(userIdHeader);
                    log.info("Usuario ID obtenido del header: {}", userId);
                } catch (NumberFormatException e) {
                    log.error("Error al parsear el ID de usuario del header: {}", e.getMessage());
                }
            }

            //ID del atributo
            if (userId == null && userIdAttribute != null) {
                userId = (Long) userIdAttribute;
                log.info("Usuario ID obtenido del atributo: {}", userId);
            }

            //valida que tenemos un usuario
            if (userId == null) {
                return crearRespuestaError("No se pudo identificar al usuario", HttpStatus.UNAUTHORIZED);
            }

            //crea objeto Usuario con el ID
            Usuario usuario = new Usuario();
            usuario.setIdUsuario(userId);
            pedido.setUsuario(usuario);

            //valida el pedido
            if (pedido.getDetalles() == null || pedido.getDetalles().isEmpty()) {
                return crearRespuestaError("El pedido no tiene detalles", HttpStatus.BAD_REQUEST);
            }

            //guarda el pedido
            Pedido savedPedido = pedidoService.save(pedido);

            log.info("Pedido guardado con ID: {}", savedPedido.getIdPedido());
            return new ResponseEntity<>(savedPedido, HttpStatus.CREATED);

        } catch (IllegalArgumentException e) {
            log.error("Error de validación al guardar pedido: {}", e.getMessage());
            return crearRespuestaError(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            log.error("Error al guardar pedido: {}", e.getMessage(), e);
            return crearRespuestaError("Error interno al procesar el pedido", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //actualiza estado del pedido
    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> updateEstadoPedido(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String nuevoEstado = body.get("estado");
            if (nuevoEstado == null || nuevoEstado.isEmpty()) {
                return crearRespuestaError("El estado no puede estar vacío", HttpStatus.BAD_REQUEST);
            }

            Pedido pedidoActualizado = pedidoService.actualizarEstadoPedido(id, nuevoEstado);
            return ResponseEntity.ok(pedidoActualizado);
        } catch (IllegalArgumentException e) {
            return crearRespuestaError(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return crearRespuestaError("Error al actualizar el estado del pedido", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //elimina pedido
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePedido(@PathVariable Long id) {
        try {
            pedidoService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return crearRespuestaError(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return crearRespuestaError("Error al eliminar el pedido", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //metodo auxiliar para crear respuestas de error
    private ResponseEntity<Map<String, String>> crearRespuestaError(String mensaje, HttpStatus status) {
        Map<String, String> response = new HashMap<>();
        response.put("error", mensaje);
        return new ResponseEntity<>(response, status);
    }
}