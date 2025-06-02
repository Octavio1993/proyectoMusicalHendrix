package com.example.instrumentos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "pagos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago")
    private Long idPago;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pedido", nullable = false)
    private Pedido pedido;

    @Column(name = "mercado_pago_preference_id")
    private String mercadoPagoPreferenceId;

    @Column(name = "mercado_pago_payment_id")
    private String mercadoPagoPaymentId;

    @Column(nullable = false)
    private String estado;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "fecha_creacion", nullable = false)
    private Date fechaCreacion;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "fecha_actualizacion")
    private Date fechaActualizacion;

    @Column(nullable = false)
    private Double monto;

    @Column(nullable = false)
    private String moneda;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    // Constructor para nuevo pago
    public Pago(Pedido pedido, Double monto) {
        this.pedido = pedido;
        this.monto = monto;
        this.estado = "PENDING";
        this.moneda = "ARS";
        this.fechaCreacion = new Date();
        this.fechaActualizacion = new Date();
    }

    @Override
    public String toString() {
        return "Pago{" +
                "idPago=" + idPago +
                ", mercadoPagoPreferenceId='" + mercadoPagoPreferenceId + '\'' +
                ", estado='" + estado + '\'' +
                ", monto=" + monto +
                ", moneda='" + moneda + '\'' +
                ", fechaCreacion=" + fechaCreacion +
                ", pedidoId=" + (pedido != null ? pedido.getIdPedido() : null) +
                '}';
    }
}