package com.example.instrumentos.config;

import com.example.instrumentos.model.Usuario;
import com.example.instrumentos.service.UsuarioService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthInterceptor implements HandlerInterceptor {

    private final UsuarioService usuarioService;
    private final ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        //solicitud con encabezado de autenticacion (X-User-Id)
        String userId = request.getHeader("X-User-Id");
        String path = request.getRequestURI();
        String method = request.getMethod();

        log.info("AuthInterceptor: path={}, method={}, X-User-Id={}", path, method, userId);

        //rutas que no requieren autenticacion
        if (isPublicRoute(path, method)) {
            return true;
        }

        //sin el id del usuario, no hay acceso
        if (userId == null || userId.isEmpty()) {
            sendUnauthorizedResponse(response, "No se ha proporcionado autenticacion");
            return false;
        }

        try {
            Long userIdLong = Long.parseLong(userId);
            Optional<Usuario> usuarioOpt = usuarioService.findById(userIdLong);

            if (usuarioOpt.isPresent()) {
                Usuario usuario = usuarioOpt.get();

                //verificacion de permisos para rutas protegidas
                if (isAdminRoute(path, method) && !"Admin".equals(usuario.getRol().getDefinicion())) {
                    sendForbiddenResponse(response, "Acceso denegado. Se requiere rol de Administrador");
                    return false;
                }

                //agrega info del usuario a la solicitud
                request.setAttribute("usuarioId", usuario.getIdUsuario());
                request.setAttribute("usuarioRol", usuario.getRol().getDefinicion());

                log.info("Usuario autenticado: id={}, rol={}", usuario.getIdUsuario(), usuario.getRol().getDefinicion());

                return true;
            } else {
                log.warn("Usuario no encontrado con ID: {}", userIdLong);
                sendUnauthorizedResponse(response, "Usuario no encontrado");
                return false;
            }
        } catch (NumberFormatException e) {
            log.error("ID de usuario invalido: {}", userId, e);
            sendUnauthorizedResponse(response, "ID de usuario invalido");
            return false;
        }
    }

    private boolean isPublicRoute(String path, String method) {
        //las rutas de autenticacion son publicas
        if (path.startsWith("/api/usuarios/login") || path.startsWith("/api/usuarios/registro")) {
            return true;
        }

        //permite al GET mostrar instrumentos y categorías
        if ("GET".equalsIgnoreCase(method)) {
            if (path.startsWith("/api/instrumentos") || path.startsWith("/api/categorias")) {
                return true;
            }
        }

        //MERCADOPAGO: El webhook debe ser público
        if (path.startsWith("/api/pagos/webhook")) {
            return true;
        }

        return false;
    }

    //rutas que solamente estan permitidas para admin
    private boolean isAdminRoute(String path, String method) {
        //CRUD de instrumentos
        if (path.startsWith("/api/instrumentos")) {
            return !method.equalsIgnoreCase("GET"); // Solo GET es público
        }

        //CRUD de categorias
        if (path.startsWith("/api/categorias")) {
            return !method.equalsIgnoreCase("GET"); // Solo GET es público
        }

        //gestion de usuarios
        if (path.startsWith("/api/usuarios") &&
                !path.startsWith("/api/usuarios/login") &&
                !path.startsWith("/api/usuarios/registro")) {
            return true;
        }

        return false;
    }

    private void sendUnauthorizedResponse(HttpServletResponse response, String message) throws Exception {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType("application/json");

        Map<String, String> errorBody = new HashMap<>();
        errorBody.put("error", message);
        errorBody.put("status", "UNAUTHORIZED");

        response.getWriter().write(objectMapper.writeValueAsString(errorBody));
    }

    private void sendForbiddenResponse(HttpServletResponse response, String message) throws Exception {
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType("application/json");

        Map<String, String> errorBody = new HashMap<>();
        errorBody.put("error", message);
        errorBody.put("status", "FORBIDDEN");

        response.getWriter().write(objectMapper.writeValueAsString(errorBody));
    }
}