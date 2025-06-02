package com.example.instrumentos.service;

import com.example.instrumentos.model.*;
import com.example.instrumentos.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final InstrumentoRepository instrumentoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final EstadoPedidoRepository estadoPedidoRepository;
    private final InstrumentoService instrumentoService;

    // Obtener todos los pedidos
    public List<Pedido> findAll() {
        return pedidoRepository.findAll();
    }

    // Buscar pedido por ID
    public Optional<Pedido> findById(Long id) {
        return pedidoRepository.findByIdWithDetalles(id);
    }

    // Obtener pedidos de un usuario específico
    public List<Pedido> findByUsuarioId(Long usuarioId) {
        return pedidoRepository.findByUsuario_IdUsuario(usuarioId);
    }

    // Crear un nuevo pedido
    public Pedido save(Pedido pedido) {
        log.info("Creando nuevo pedido");

        // Validar que el pedido tenga usuario
        if (pedido.getUsuario() == null || pedido.getUsuario().getIdUsuario() == null) {
            throw new IllegalArgumentException("El pedido debe tener un usuario asignado");
        }

        // Obtener el usuario
        Usuario usuario = usuarioRepository.findById(pedido.getUsuario().getIdUsuario())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        pedido.setUsuario(usuario);

        // Establecer fecha si es un pedido nuevo
        if (pedido.getFecha() == null) {
            pedido.setFecha(new Date());
        }

        // Procesar los detalles del pedido
        if (pedido.getDetalles() == null || pedido.getDetalles().isEmpty()) {
            throw new IllegalArgumentException("El pedido debe tener al menos un detalle");
        }

        // Guardar el pedido primero
        Pedido savedPedido = pedidoRepository.save(pedido);

        // Procesar cada detalle
        List<DetallePedido> detallesGuardados = new ArrayList<>();
        double total = 0.0;

        for (DetallePedido detalle : pedido.getDetalles()) {
            // Obtener el instrumento
            Instrumento instrumento = instrumentoRepository
                    .findById(detalle.getInstrumentoId()) // ✅ CORRECTO
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Instrumento no encontrado: " + detalle.getInstrumentoId()));

            // Verificar stock disponible
            if (instrumento.getStock() < detalle.getCantidad()) {
                throw new IllegalArgumentException(
                        "Stock insuficiente para " + instrumento.getDenominacion() +
                                ". Stock disponible: " + instrumento.getStock());
            }

            // Actualizar stock
            instrumentoService.actualizarStock(instrumento.getIdInstrumento(), detalle.getCantidad());

            // Configurar el detalle
            detalle.setPedido(savedPedido);
            detalle.setInstrumento(instrumento);

            // Guardar el detalle
            DetallePedido detalleGuardado = detallePedidoRepository.save(detalle);
            detallesGuardados.add(detalleGuardado);

            // Sumar al total - USAR EL PRECIO DEL INSTRUMENTO ACTUAL
            total += instrumento.getPrecioActual() * detalle.getCantidad();
        }

        savedPedido.setDetalles(detallesGuardados);

        // Crear el estado inicial del pedido
        EstadoPedido estadoInicial = new EstadoPedido("PENDIENTE", savedPedido);
        estadoPedidoRepository.save(estadoInicial);

        log.info("Pedido creado con ID: {} - Total: ${}", savedPedido.getIdPedido(), total);

        return savedPedido;
    }

    // Actualizar estado del pedido
    public Pedido actualizarEstadoPedido(Long pedidoId, String nuevoEstado) {
        log.info("Actualizando estado del pedido {} a {}", pedidoId, nuevoEstado);

        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado"));

        // Crear nuevo registro de estado
        EstadoPedido nuevoEstadoPedido = new EstadoPedido(nuevoEstado, pedido);
        estadoPedidoRepository.save(nuevoEstadoPedido);

        // Si el pedido se cancela, devolver el stock
        if ("CANCELADO".equals(nuevoEstado)) {
            for (DetallePedido detalle : pedido.getDetalles()) {
                instrumentoService.reponerStock(
                        detalle.getInstrumento().getIdInstrumento(),
                        detalle.getCantidad()
                );
            }
        }

        return pedido;
    }

    // Eliminar pedido (solo si está en estado PENDIENTE)
    public void deleteById(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado"));

        // Verificar que el pedido esté en estado PENDIENTE
        if (!"PENDIENTE".equals(pedido.getEstadoActual())) {
            throw new IllegalArgumentException("Solo se pueden eliminar pedidos en estado PENDIENTE");
        }

        // Devolver el stock
        for (DetallePedido detalle : pedido.getDetalles()) {
            instrumentoService.reponerStock(
                    detalle.getInstrumento().getIdInstrumento(),
                    detalle.getCantidad()
            );
        }

        pedidoRepository.deleteById(id);
    }

    // Método auxiliar para enriquecer pedido con información de instrumentos
    public Pedido enrichPedidoWithInstrumentos(Pedido pedido) {
        // Con JPA y las relaciones bien configuradas, esto ya viene cargado
        return pedido;
    }
}
