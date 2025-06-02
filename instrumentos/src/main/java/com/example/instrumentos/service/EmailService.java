package com.example.instrumentos.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.from.email:musicalHendrix@gmail.com}")
    private String fromEmail;

    @Value("${mail.from.name:Musical Hendrix - Mendoza}")
    private String fromName;

    @Value("${mail.base.url:http://localhost:5173}")
    private String baseUrl;

    public void sendPasswordResetEmail(String email, String nombre, String token) {
        try {
            String resetUrl = baseUrl + "/reset-password?token=" + token;

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(email);
            helper.setFrom(fromEmail, fromName);
            helper.setSubject("Recuperación de contraseña - Musical Hendrix");

            String htmlContent = createPasswordResetEmailTemplate(nombre, resetUrl);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email de recuperación enviado a: {}", email);

        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Error al enviar email: {}", e.getMessage());
            throw new RuntimeException("Error al enviar email", e);
        }
    }

    public void sendWelcomeEmail(String email, String nombre) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(email);
            helper.setFrom(fromEmail, fromName);
            helper.setSubject("¡Bienvenido a Musical Hendrix!");

            String htmlContent = createWelcomeEmailTemplate(nombre);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email de bienvenida enviado a: {}", email);

        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Error al enviar email de bienvenida: {}", e.getMessage());
        }
    }

    private String createPasswordResetEmailTemplate(String nombre, String resetUrl) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; }
                    .container { max-width: 600px; margin: 0 auto; background: white; }
                    .header { 
                        background: linear-gradient(135deg, #2c3e50, #34495e); 
                        color: white; 
                        padding: 30px 20px; 
                        text-align: center; 
                    }
                    .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
                    .tagline { font-size: 14px; opacity: 0.9; }
                    .content { padding: 30px 20px; background: #f8f9fa; }
                    .button { 
                        display: inline-block; 
                        background: #e74c3c; 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        margin: 20px 0;
                        font-weight: bold;
                        transition: background 0.3s;
                    }
                    .button:hover { background: #c0392b; }
                    .footer { 
                        background: #2c3e50; 
                        color: white; 
                        padding: 20px; 
                        text-align: center; 
                        font-size: 12px; 
                    }
                    .footer a { color: #3498db; text-decoration: none; }
                    .highlight { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">🎵 Musical Hendrix</div>
                        <div class="tagline">Tu tienda de instrumentos musicales en Mendoza</div>
                    </div>
                    
                    <div class="content">
                        <h2>¡Hola %s! 👋</h2>
                        
                        <p>Recibimos una solicitud para recuperar la contraseña de tu cuenta en Musical Hendrix.</p>
                        
                        <p>Para crear una nueva contraseña, simplemente haz clic en el botón de abajo:</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="%s" class="button">🔑 Recuperar mi contraseña</a>
                        </div>
                        
                        <div class="highlight">
                            <strong>⏰ Importante:</strong> Este enlace expira en 30 minutos por tu seguridad.
                        </div>
                        
                        <p>Si no solicitaste este cambio, puedes ignorar este email. Tu cuenta permanecerá segura.</p>
                        
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        
                        <p style="font-size: 12px; color: #666;">
                            <strong>¿El botón no funciona?</strong><br>
                            Copia y pega este enlace en tu navegador:<br>
                            <a href="%s" style="color: #3498db; word-break: break-all;">%s</a>
                        </p>
                    </div>
                    
                    <div class="footer">
                        <p><strong>Musical Hendrix</strong></p>
                        <p>📍 Av. Las Heras y Av. San Martín, Ciudad de Mendoza</p>
                        <p>📞 (261) 555-1234 | 📧 musicalHendrix@gmail.com</p>
                        <p style="margin-top: 15px;">
                            © 2025 Musical Hendrix. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(nombre, resetUrl, resetUrl, resetUrl);
    }

    private String createWelcomeEmailTemplate(String nombre) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; }
                    .container { max-width: 600px; margin: 0 auto; background: white; }
                    .header { 
                        background: linear-gradient(135deg, #27ae60, #2ecc71); 
                        color: white; 
                        padding: 30px 20px; 
                        text-align: center; 
                    }
                    .content { padding: 30px 20px; }
                    .button { 
                        display: inline-block; 
                        background: #e74c3c; 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        margin: 20px 0;
                        font-weight: bold;
                    }
                    .features { 
                        display: flex; 
                        justify-content: space-around; 
                        margin: 20px 0; 
                        flex-wrap: wrap;
                    }
                    .feature { 
                        text-align: center; 
                        margin: 10px; 
                        flex: 1; 
                        min-width: 150px;
                    }
                    .footer { 
                        background: #2c3e50; 
                        color: white; 
                        padding: 20px; 
                        text-align: center; 
                        font-size: 12px; 
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 ¡Bienvenido a Musical Hendrix!</h1>
                        <p>¡Nos alegra tenerte en nuestra familia musical!</p>
                    </div>
                    
                    <div class="content">
                        <h2>¡Hola %s! 🎵</h2>
                        
                        <p>¡Tu cuenta ha sido creada exitosamente! Ahora formas parte de la comunidad Musical Hendrix, donde la música cobra vida.</p>
                        
                        <div class="features">
                            <div class="feature">
                                <h3>🎸</h3>
                                <p><strong>Instrumentos de calidad</strong><br>Guitarras, bajos, baterías y más</p>
                            </div>
                            <div class="feature">
                                <h3>🚚</h3>
                                <p><strong>Envíos rápidos</strong><br>A toda la provincia de Mendoza</p>
                            </div>
                            <div class="feature">
                                <h3>🛠️</h3>
                                <p><strong>Servicio técnico</strong><br>Mantenimiento y reparaciones</p>
                            </div>
                        </div>
                        
                        <p>¿Listo para explorar nuestro catálogo?</p>
                        
                        <div style="text-align: center;">
                            <a href="%s/productos" class="button">🎵 Explorar Instrumentos</a>
                        </div>
                        
                        <p>Si tienes alguna pregunta, no dudes en contactarnos. ¡Estamos aquí para ayudarte a hacer música!</p>
                        
                        <p>¡Que disfrutes haciendo música! 🎶</p>
                        
                        <p>Saludos musicales,<br>
                        <strong>El equipo de Musical Hendrix</strong></p>
                    </div>
                    
                    <div class="footer">
                        <p><strong>Musical Hendrix - Mendoza</strong></p>
                        <p>📍 Av. Las Heras y Av. San Martín, Ciudad de Mendoza</p>
                        <p>📞 (261) 555-1234 | 📧 musicalHendrix@gmail.com</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(nombre, baseUrl);
    }
}