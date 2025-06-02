package com.example.instrumentos.repository;

import com.example.instrumentos.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByUsuario_IdUsuario(Long idUsuario);

    @Query("SELECT p FROM Pedido p LEFT JOIN FETCH p.detalles d LEFT JOIN FETCH d.instrumento WHERE p.idPedido = :id")
    Optional<Pedido> findByIdWithDetalles(@Param("id") Long id);

    @Query("SELECT p FROM Pedido p WHERE p.fecha BETWEEN :fechaInicio AND :fechaFin")
    List<Pedido> findByFechaBetween(@Param("fechaInicio") Date fechaInicio, @Param("fechaFin") Date fechaFin);
}
