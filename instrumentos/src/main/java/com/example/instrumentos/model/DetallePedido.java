package com.example.instrumentos.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "DetallePedido")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetallePedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDetallePedido;

    @ManyToOne
    @JoinColumn(name = "idPedido")
    @JsonIgnore
    private Pedido pedido;

    @ManyToOne
    @JoinColumn(name = "id_instrumento", insertable = false, updatable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "detallesPedido", "historialPrecios"})
    private Instrumento instrumento;

    // AGREGAR ESTE CAMPO:
    @Column(name = "id_instrumento")
    private Long instrumentoId;

    @Column(name = "precio_unitario")
    private Double precioUnitario;

    private Integer cantidad;

    @Override
    public String toString() {
        return "DetallePedido{" +
                "idDetallePedido=" + idDetallePedido +
                ", instrumentoId=" + instrumentoId +
                ", cantidad=" + cantidad +
                ", precioUnitario=" + precioUnitario +
                ", pedidoId=" + (pedido != null ? pedido.getIdPedido() : null) +
                '}';
    }
}