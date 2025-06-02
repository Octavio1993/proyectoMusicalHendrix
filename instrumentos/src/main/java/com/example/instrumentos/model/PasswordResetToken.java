package com.example.instrumentos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "password_reset_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false)
    private Date fechaExpiracion;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false)
    private Date fechaCreacion;

    @Column(nullable = false)
    private Boolean usado = false;

    // Constructor conveniente
    public PasswordResetToken(String token, Usuario usuario, int minutosExpiracion) {
        this.token = token;
        this.usuario = usuario;
        this.fechaCreacion = new Date();
        this.fechaExpiracion = new Date(System.currentTimeMillis() + (minutosExpiracion * 60 * 1000));
        this.usado = false;
    }

    public boolean isExpired() {
        return new Date().after(this.fechaExpiracion);
    }
}