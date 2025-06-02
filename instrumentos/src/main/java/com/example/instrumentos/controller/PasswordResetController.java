package com.example.instrumentos.controller;

import com.example.instrumentos.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El email es requerido"));
            }

            passwordResetService.createPasswordResetToken(email);

            return ResponseEntity.ok()
                    .body(Map.of("message", "Si el email existe, recibirás un enlace de recuperación"));

        } catch (Exception e) {
            log.error("Error en forgot password: {}", e.getMessage());
            return ResponseEntity.ok()
                    .body(Map.of("message", "Si el email existe, recibirás un enlace de recuperación"));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            String newPassword = request.get("password");

            if (token == null || newPassword == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Token y nueva contraseña son requeridos"));
            }

            if (newPassword.length() < 6) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "La contraseña debe tener al menos 6 caracteres"));
            }

            passwordResetService.resetPassword(token, newPassword);

            return ResponseEntity.ok()
                    .body(Map.of("message", "Contraseña actualizada exitosamente"));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error en reset password: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Error interno del servidor"));
        }
    }

    @GetMapping("/verify-reset-token/{token}")
    public ResponseEntity<?> verifyResetToken(@PathVariable String token) {
        try {
            boolean isValid = passwordResetService.validatePasswordResetToken(token);
            return ResponseEntity.ok()
                    .body(Map.of("valid", isValid));
        } catch (Exception e) {
            return ResponseEntity.ok()
                    .body(Map.of("valid", false));
        }
    }
}
