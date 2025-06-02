package com.example.instrumentos.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "estados_pedido")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstadoPedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estado_pedido")
    private Long idEstadoPedido;

    @Column(nullable = false)
    private String estado;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false)
    private Date fecha;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pedido", nullable = false)
    @JsonIgnore
    private Pedido pedido;

    // Constructor conveniente
    public EstadoPedido(String estado, Pedido pedido) {
        this.estado = estado;
        this.fecha = new Date();
        this.pedido = pedido;
    }

    @Override
    public String toString() {
        return "EstadoPedido{" +
                "idEstadoPedido=" + idEstadoPedido +
                ", estado='" + estado + '\'' +
                ", fecha=" + fecha +
                ", pedidoId=" + (pedido != null ? pedido.getIdPedido() : null) +
                '}';
    }
}
