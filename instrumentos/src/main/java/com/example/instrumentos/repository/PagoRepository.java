package com.example.instrumentos.repository;

import com.example.instrumentos.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findByPedido_IdPedido(Long idPedido);
    Optional<Pago> findByMercadoPagoPreferenceId(String preferenceId);
    Optional<Pago> findByMercadoPagoPaymentId(String paymentId);
}
