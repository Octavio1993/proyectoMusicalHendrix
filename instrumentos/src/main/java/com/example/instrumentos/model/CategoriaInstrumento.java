package com.example.instrumentos.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "categorias_instrumento")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaInstrumento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria_instrumento")
    private Long idCategoriaInstrumento;

    @Column(name = "denominacion", nullable = false, unique = true)
    private String denominacion;

    // Relación con Instrumentos
    @OneToMany(mappedBy = "categoriaInstrumento", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Instrumento> instrumentos;

    // Constructor conveniente
    public CategoriaInstrumento(String denominacion) {
        this.denominacion = denominacion;
    }

    @Override
    public String toString() {
        return "CategoriaInstrumento{" +
                "idCategoriaInstrumento=" + idCategoriaInstrumento +
                ", denominacion='" + denominacion + '\'' +
                '}';
    }
}
