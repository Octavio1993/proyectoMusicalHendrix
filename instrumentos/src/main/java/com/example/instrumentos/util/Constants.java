package com.example.instrumentos.util;

public class Constants {

    public static class Roles {
        public static final String ADMIN = "Admin";
        public static final String OPERADOR = "Operador";
        public static final String VISOR = "Visor";
    }

    public static class EstadosPedido {
        public static final String PENDIENTE = "PENDIENTE";
        public static final String CONFIRMADO = "CONFIRMADO";
        public static final String ENVIADO = "ENVIADO";
        public static final String ENTREGADO = "ENTREGADO";
        public static final String CANCELADO = "CANCELADO";
    }

    public static class Headers {
        public static final String USER_ID = "X-User-Id";
        public static final String USER_ROLE = "X-User-Role";
    }
}