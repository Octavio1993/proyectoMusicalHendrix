package com.example.instrumentos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "historial_precio_instrumento")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistorialPrecioInstrumento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_instrumento", nullable = false)
    private Instrumento instrumento;

    @Column(nullable = false)
    private Double precio;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false)
    private Date fecha;

    // Constructor conveniente
    public HistorialPrecioInstrumento(Instrumento instrumento, Double precio) {
        this.instrumento = instrumento;
        this.precio = precio;
        this.fecha = new Date();
    }

    @Override
    public String toString() {
        return "HistorialPrecioInstrumento{" +
                "id=" + id +
                ", precio=" + precio +
                ", fecha=" + fecha +
                ", instrumentoId=" + (instrumento != null ? instrumento.getIdInstrumento() : null) +
                '}';
    }
}
