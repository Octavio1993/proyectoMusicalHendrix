package com.example.instrumentos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.Date;
import java.util.List;

@Entity
@Table(name = "pedidos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido")
    private Long idPedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Usuario usuario;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false)
    private Date fecha;

    // Relación con DetallePedido
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetallePedido> detalles;

    // Relación con EstadoPedido
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL)
    @OrderBy("fecha DESC")
    private List<EstadoPedido> estados;

    // Relación con Pagos
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Pago> pagos;

    // Método para obtener el estado actual
    @Transient
    public String getEstadoActual() {
        if (estados != null && !estados.isEmpty()) {
            return estados.get(0).getEstado();
        }
        return "PENDIENTE";
    }

    // Método para calcular el total del pedido
    @Transient
    public Double getTotalPedido() {
        if (detalles == null || detalles.isEmpty()) {
            return 0.0;
        }
        return detalles.stream()
                .mapToDouble(d -> d.getCantidad() *
                        (d.getPrecioUnitario() != null ? d.getPrecioUnitario() :
                                (d.getInstrumento() != null ? d.getInstrumento().getPrecioActual() : 0.0)))
                .sum();
    }

    @Override
    public String toString() {
        return "Pedido{" +
                "idPedido=" + idPedido +
                ", fecha=" + fecha +
                ", usuarioId=" + (usuario != null ? usuario.getIdUsuario() : null) +
                ", cantidadDetalles=" + (detalles != null ? detalles.size() : 0) +
                '}';
    }
}
