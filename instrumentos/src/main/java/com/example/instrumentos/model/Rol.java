package com.example.instrumentos.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Rol {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rol")
    private Long idRol;

    @Column(name = "definicion", nullable = false, unique = true)
    private String definicion;

    // Relación bidireccional con Usuario
    @OneToMany(mappedBy = "rol", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Usuario> usuarios;

    // Constructor sin la lista de usuarios para facilitar la creación
    public Rol(String definicion) {
        this.definicion = definicion;
    }

    @Override
    public String toString() {
        return "Rol{" +
                "idRol=" + idRol +
                ", definicion='" + definicion + '\'' +
                '}';
    }
}
