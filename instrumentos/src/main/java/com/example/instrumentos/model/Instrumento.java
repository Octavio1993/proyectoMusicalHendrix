package com.example.instrumentos.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "instrumentos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Instrumento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_instrumento")
    private Long idInstrumento;

    @Column(nullable = false, unique = true)
    private String codigo;

    @Column(nullable = false)
    private String denominacion;

    @Column(nullable = false)
    private String marca;

    @Column(nullable = false)
    private Integer stock;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "imagen")
    private String imagen;

    // Relación con CategoriaInstrumento
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_categoria_instrumento", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "instrumentos"})
    private CategoriaInstrumento categoriaInstrumento;

    // Relación con DetallePedido
    @OneToMany(mappedBy = "instrumento")
    @JsonIgnore
    private List<DetallePedido> detallesPedido;

    // Relación con HistorialPrecioInstrumento
    @OneToMany(mappedBy = "instrumento", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<HistorialPrecioInstrumento> historialPrecios;

    // Método para obtener el precio actual
    @Transient
    public Double getPrecioActual() {
        if (historialPrecios != null && !historialPrecios.isEmpty()) {
            return historialPrecios.stream()
                    .max((h1, h2) -> h1.getFecha().compareTo(h2.getFecha()))
                    .map(HistorialPrecioInstrumento::getPrecio)
                    .orElse(0.0);
        }
        return 0.0;
    }

    @Override
    public String toString() {
        return "Instrumento{" +
                "idInstrumento=" + idInstrumento +
                ", codigo='" + codigo + '\'' +
                ", denominacion='" + denominacion + '\'' +
                ", marca='" + marca + '\'' +
                ", stock=" + stock +
                ", categoriaId=" + (categoriaInstrumento != null ?
                categoriaInstrumento.getIdCategoriaInstrumento() : null) +
                '}';
    }
}
