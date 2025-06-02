package com.example.instrumentos.repository;

import com.example.instrumentos.model.EstadoPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EstadoPedidoRepository extends JpaRepository<EstadoPedido, Long> {
    List<EstadoPedido> findByPedido_IdPedidoOrderByFechaDesc(Long idPedido);
}
