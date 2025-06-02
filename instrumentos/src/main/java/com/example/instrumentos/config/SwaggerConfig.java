package com.example.instrumentos.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API Sistema de Instrumentos Musicales")
                        .version("1.0")
                        .description("API REST para la gestión de instrumentos musicales, usuarios y pedidos")
                        .contact(new Contact()
                                .name("Equipo de Desarrollo")
                                .email("desarrollo@instrumentos.com")));
    }
}