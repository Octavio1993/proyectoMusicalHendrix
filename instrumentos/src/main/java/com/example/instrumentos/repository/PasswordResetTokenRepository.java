package com.example.instrumentos.repository;

import com.example.instrumentos.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByUsuario_Email(String email);
    void deleteByUsuario_Email(String email);
    void deleteByFechaExpiracionBefore(Date now);
}