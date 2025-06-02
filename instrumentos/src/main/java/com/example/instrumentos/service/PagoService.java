package com.example.instrumentos.service;

import com.example.instrumentos.config.MercadoPagoConfiguration;
import com.example.instrumentos.model.*;
import com.example.instrumentos.repository.PagoRepository;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.preference.Preference;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PagoService {

    private final PagoRepository pagoRepository;
    private final PedidoService pedidoService;
    private final InstrumentoService instrumentoService;
    private final MercadoPagoConfiguration mercadoPagoConfig;

    // Crear pago para un pedido mediante MercadoPago
    public Map<String, String> crearPago(Long pedidoId) throws MPException, MPApiException {
        log.info("Iniciando creación de pago para pedido ID: {}", pedidoId);

        try {
            // Obtener el pedido
            Pedido pedido = pedidoService.findById(pedidoId)
                    .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado: " + pedidoId));

            log.info("Pedido encontrado: {}", pedido);

            // Validar que el pedido tenga detalles
            if (pedido.getDetalles() == null || pedido.getDetalles().isEmpty()) {
                throw new IllegalArgumentException("El pedido no tiene detalles");
            }

            // Calcular y validar el total
            Double total = pedido.getTotalPedido();
            log.info("Total del pedido calculado: {}", total);

            if (total == null || total <= 0) {
                throw new IllegalArgumentException("El total del pedido debe ser mayor a cero. Total: " + total);
            }

            // Crear registro de pago en la base de datos
            Pago pago = new Pago(pedido, total);
            pago.setDescripcion("Pago del pedido #" + pedidoId);

            // Crear los items para MercadoPago
            List<PreferenceItemRequest> items = new ArrayList<>();

            for (DetallePedido detalle : pedido.getDetalles()) {
                Instrumento instrumento = detalle.getInstrumento();

                // Validar datos del instrumento
                if (instrumento == null) {
                    throw new IllegalArgumentException("Detalle sin instrumento asociado");
                }

                Double precioActual = instrumento.getPrecioActual();
                log.info("Procesando instrumento: {} - Precio: {} - Cantidad: {}",
                        instrumento.getDenominacion(), precioActual, detalle.getCantidad());

                if (precioActual == null || precioActual <= 0) {
                    throw new IllegalArgumentException("Precio inválido para instrumento: " + instrumento.getDenominacion());
                }

                String title = instrumento.getDenominacion();
                if (title == null || title.trim().isEmpty()) {
                    title = "Instrumento Musical";
                }
                if (title.length() > 60) {
                    title = title.substring(0, 57) + "...";
                }

                // Crear item con validaciones adicionales
                PreferenceItemRequest item = PreferenceItemRequest.builder()
                        .title(title)
                        .quantity(detalle.getCantidad())
                        .unitPrice(BigDecimal.valueOf(precioActual))
                        .currencyId("ARS") // ¡IMPORTANTE! Agregar currency ID
                        .description("Código: " + (instrumento.getCodigo() != null ? instrumento.getCodigo() : "N/A"))
                        .build();

                items.add(item);

                log.info("Item creado: Título={}, Cantidad={}, Precio={}",
                        title, detalle.getCantidad(), precioActual);
            }

            log.info("Total de items creados: {}", items.size());

            // URLs de retorno
            String successUrl = buildRedirectUrl(mercadoPagoConfig.getSuccessUrl(), pedidoId);
            String failureUrl = buildRedirectUrl(mercadoPagoConfig.getFailureUrl(), pedidoId);
            String pendingUrl = buildRedirectUrl(mercadoPagoConfig.getPendingUrl(), pedidoId);

            log.info("URLs configuradas - Success: {}, Failure: {}, Pending: {}",
                    successUrl, failureUrl, pendingUrl);

            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success(successUrl)
                    .failure(failureUrl)
                    .pending(pendingUrl)
                    .build();

            // Crear la preferencia con configuración adicional
            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(items)
                    .backUrls(backUrls)
                    .externalReference(pedidoId.toString())
                    //.autoReturn("approved")  // CAMBIO: solo retornar automáticamente si es aprobado
                    .expires(false)
                    .build();

            log.info("PreferenceRequest creado con external_reference: {}", pedidoId);

            // Log del access token (solo primeros caracteres por seguridad)
            String tokenInfo = MercadoPagoConfig.getAccessToken();
            if (tokenInfo != null && tokenInfo.length() > 10) {
                log.info("Access token configurado: {}...", tokenInfo.substring(0, 10));
            } else {
                log.error("Access token no configurado o inválido!");
                throw new IllegalStateException("Access token de MercadoPago no configurado correctamente");
            }

            PreferenceClient client = new PreferenceClient();

            log.info("Enviando request a MercadoPago...");
            Preference preference = client.create(preferenceRequest);

            log.info("Preferencia creada exitosamente, ID: {}", preference.getId());
            log.info("Init Point: {}", preference.getInitPoint());
            log.info("Sandbox Init Point: {}", preference.getSandboxInitPoint());

            // Guardar el pago con el ID de preferencia
            pago.setMercadoPagoPreferenceId(preference.getId());
            pagoRepository.save(pago);

            log.info("Pago guardado en BD con ID: {}", pago.getIdPago());

            // Devolver las URLs necesarias
            Map<String, String> response = new HashMap<>();
            response.put("preference_id", preference.getId());
            response.put("init_point", preference.getInitPoint());

            if (mercadoPagoConfig.isSandboxMode()) {
                response.put("sandbox_init_point", preference.getSandboxInitPoint());
            }

            return response;

        } catch (MPApiException e) {
            log.error("=== ERROR DE MERCADOPAGO API ===");
            log.error("Status Code: {}", e.getStatusCode());
            log.error("Message: {}", e.getMessage());

            // Intentar obtener más detalles
            try {
                if (e.getApiResponse() != null) {
                    log.error("API Response Body: {}", e.getApiResponse().getContent());
                }
            } catch (Exception ex) {
                log.error("No se pudo obtener el contenido de la respuesta");
            }

            // Log de la causa raíz
            if (e.getCause() != null) {
                log.error("Causa raíz: {}", e.getCause().getMessage());
            }

            throw new RuntimeException("Error de MercadoPago API: " + e.getMessage(), e);

        } catch (MPException e) {
            log.error("=== ERROR GENERAL DE MERCADOPAGO ===");
            log.error("Message: {}", e.getMessage());
            log.error("Causa: {}", e.getCause() != null ? e.getCause().getMessage() : "N/A");

            throw new RuntimeException("Error de MercadoPago: " + e.getMessage(), e);

        } catch (Exception e) {
            log.error("=== ERROR INESPERADO ===");
            log.error("Tipo: {}", e.getClass().getSimpleName());
            log.error("Mensaje: {}", e.getMessage());
            log.error("Stack trace:", e);

            throw new RuntimeException("Error inesperado al crear pago: " + e.getMessage(), e);
        }
    }

    // Procesar notificación de MercadoPago
    public void procesarNotificacion(String preferenceId, String status) {
        log.info("Procesando notificación - PreferenceId: {}, Status: {}", preferenceId, status);

        Optional<Pago> pagoOpt = pagoRepository.findByMercadoPagoPreferenceId(preferenceId);

        if (pagoOpt.isPresent()) {
            Pago pago = pagoOpt.get();
            String estadoAnterior = pago.getEstado();

            pago.setEstado(status);
            pago.setFechaActualizacion(new Date());
            pagoRepository.save(pago);

            log.info("Pago actualizado: {} - Estado anterior: {}, Nuevo estado: {}",
                    pago.getIdPago(), estadoAnterior, status);

            // Si el pago es aprobado, actualizar el estado del pedido
            if ("approved".equalsIgnoreCase(status) && !"approved".equalsIgnoreCase(estadoAnterior)) {
                try {
                    pedidoService.actualizarEstadoPedido(pago.getPedido().getIdPedido(), "PAGADO");
                    log.info("Estado del pedido {} actualizado a PAGADO", pago.getPedido().getIdPedido());
                } catch (Exception e) {
                    log.error("Error al actualizar estado del pedido: {}", e.getMessage(), e);
                }
            }
        } else {
            log.error("No se encontró el pago con preferenceId: {}", preferenceId);
        }
    }

    // Obtener pagos por pedido
    public List<Pago> obtenerPagosPorPedido(Long pedidoId) {
        return pagoRepository.findByPedido_IdPedido(pedidoId);
    }

    // Obtener pago por ID
    public Optional<Pago> obtenerPago(Long pagoId) {
        return pagoRepository.findById(pagoId);
    }

    private String buildRedirectUrl(String baseUrl, Long pedidoId) {
        if (baseUrl.contains("?")) {
            return baseUrl + "&pedido_id=" + pedidoId;
        } else {
            return baseUrl + "?pedido_id=" + pedidoId;
        }
    }
}