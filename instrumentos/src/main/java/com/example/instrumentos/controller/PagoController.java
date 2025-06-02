package com.example.instrumentos.controller;

import com.example.instrumentos.dto.response.MercadoPagoResponseDTO;
import com.example.instrumentos.dto.response.PagoResponseDTO;
import com.example.instrumentos.mapper.PagoMapper;
import com.example.instrumentos.model.Pago;
import com.example.instrumentos.service.PagoService;
import com.example.instrumentos.service.PedidoService;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pagos")
@RequiredArgsConstructor
@Slf4j
public class PagoController {

    private final PagoService pagoService;
    private final PagoMapper pagoMapper;
    private final PedidoService pedidoService;

    //crea pago para un pedido
    @PostMapping("/crear/{pedidoId}")
    public ResponseEntity<?> crearPago(@PathVariable Long pedidoId) {
        try {
            Map<String, String> datosPago = pagoService.crearPago(pedidoId);

            MercadoPagoResponseDTO response = MercadoPagoResponseDTO.builder()
                    .preferenceId(datosPago.get("preference_id"))
                    .initPoint(datosPago.get("init_point"))
                    .sandboxInitPoint(datosPago.get("sandbox_init_point"))
                    .build();

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Error al crear pago: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (MPException | MPApiException e) {
            log.error("Error de Mercado Pago: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al procesar el pago con Mercado Pago");
            return ResponseEntity.internalServerError().body(error);
        }
    }

    //obtengo los pagos de un pedido
    @GetMapping("/pedido/{pedidoId}")
    public ResponseEntity<List<PagoResponseDTO>> obtenerPagosPorPedido(@PathVariable Long pedidoId) {
        List<Pago> pagos = pagoService.obtenerPagosPorPedido(pedidoId);
        List<PagoResponseDTO> response = pagoMapper.toDTOList(pagos);
        return ResponseEntity.ok(response);
    }

    //Webhook para notificaciones de MercadoPago
    @PostMapping("/webhook")
    public ResponseEntity<?> webhookMercadoPago(
            @RequestParam(value = "topic", required = false) String topic,
            @RequestParam(value = "id", required = false) String id,
            @RequestParam(value = "preference_id", required = false) String preferenceId,
            @RequestParam(value = "status", required = false) String status,
            @RequestBody(required = false) String body) {

        log.info("Webhook recibido - Topic: {}, ID: {}, Preference: {}, Status: {}",
                topic, id, preferenceId, status);

        if (preferenceId != null && status != null) {
            pagoService.procesarNotificacion(preferenceId, status);
        }

        return ResponseEntity.ok().build();
    }

    //pago especifico
    @GetMapping("/{pagoId}")
    public ResponseEntity<?> obtenerPago(@PathVariable Long pagoId) {
        return pagoService.obtenerPago(pagoId)
                .map(pago -> ResponseEntity.ok(pagoMapper.toDTO(pago)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/crear")
    public ResponseEntity<?> crearPago(@RequestBody Map<String, Object> request) {
        try {
            Long pedidoId = Long.valueOf(request.get("pedidoId").toString());
            Map<String, String> response = pagoService.crearPago(pedidoId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}