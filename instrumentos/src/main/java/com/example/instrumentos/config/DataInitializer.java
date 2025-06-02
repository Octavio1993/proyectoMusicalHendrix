package com.example.instrumentos.config;

import com.example.instrumentos.model.*;
import com.example.instrumentos.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.util.Date;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaInstrumentoRepository categoriaRepository;
    private final InstrumentoRepository instrumentoRepository;
    private final HistorialPrecioRepository historialPrecioRepository;
    private final ResourceLoader resourceLoader;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        //inicializa roles
        inicializarRoles();

        //inicializa usuario admin
        inicializarUsuarioAdmin();

        //inicializa categorias
        inicializarCategorias();

        //carga los instrumentos desde JSON
        loadInstrumentosFromJson();
    }

    private void inicializarRoles() {
        if (rolRepository.count() == 0) {
            log.info("Inicializando roles...");
            rolRepository.save(new Rol("Admin"));
            rolRepository.save(new Rol("Operador"));
            rolRepository.save(new Rol("Visor"));
            log.info("Roles creados exitosamente");
        }
    }

    private void inicializarUsuarioAdmin() {
        if (usuarioRepository.count() == 0) {
            log.info("Creando usuario administrador...");
            Rol rolAdmin = rolRepository.findByDefinicion("Admin")
                    .orElseThrow(() -> new RuntimeException("Rol Admin no encontrado"));

            Usuario admin = new Usuario();
            admin.setNombre("Administrador");
            admin.setApellido("Sistema");
            admin.setEmail("admin@instrumentos.com");
            //contraseña: admin123 encriptada con MD5
            admin.setContrasenia("0192023a7bbd73250516f069df18b500");
            admin.setRol(rolAdmin);

            usuarioRepository.save(admin);
            log.info("Usuario administrador creado exitosamente - Email: admin@instrumentos.com");
        }
    }

    private void inicializarCategorias() {
        if (categoriaRepository.count() == 0) {
            log.info("Inicializando categorías...");
            categoriaRepository.save(new CategoriaInstrumento("Cuerda"));
            categoriaRepository.save(new CategoriaInstrumento("Viento"));
            categoriaRepository.save(new CategoriaInstrumento("Percusión"));
            categoriaRepository.save(new CategoriaInstrumento("Teclado"));
            categoriaRepository.save(new CategoriaInstrumento("Varios"));
            log.info("Categorías creadas exitosamente");
        }
    }

    private void loadInstrumentosFromJson() {
        try {
            if (instrumentoRepository.count() > 0) {
                log.info("Los instrumentos ya están cargados en la base de datos");
                return;
            }

            log.info("Intentando cargar instrumentos desde archivo JSON...");

            Resource resource = resourceLoader.getResource("classpath:data/instrumentos.json");

            if (!resource.exists()) {
                log.warn("No se encontró el archivo instrumentos.json en la ruta classpath:data/");
                return;
            }

            try (InputStream inputStream = resource.getInputStream()) {
                JsonNode rootNode = objectMapper.readTree(inputStream);
                JsonNode instrumentosNode = rootNode.get("instrumentos");

                if (instrumentosNode != null && instrumentosNode.isArray()) {
                    int count = 0;

                    for (JsonNode instrumentoNode : instrumentosNode) {
                        Instrumento instrumento = new Instrumento();

                        // Generar código único basado en el ID del JSON
                        String jsonId = instrumentoNode.has("id") ? instrumentoNode.get("id").asText() : String.valueOf(count + 1);
                        instrumento.setCodigo("INST-" + jsonId);

                        // Mapear denominación desde el campo "instrumento" del JSON
                        instrumento.setDenominacion(instrumentoNode.get("instrumento").asText());
                        instrumento.setMarca(instrumentoNode.get("marca").asText());
                        instrumento.setStock(instrumentoNode.get("cantidadVendida").asInt()); // Usar cantidadVendida como stock inicial
                        instrumento.setDescripcion(instrumentoNode.get("descripcion").asText());
                        instrumento.setImagen(instrumentoNode.get("imagen").asText());

                        // Asignar categoría
                        CategoriaInstrumento categoria = determinarCategoria(instrumento.getDenominacion());
                        instrumento.setCategoriaInstrumento(categoria);

                        // Guardar instrumento
                        instrumento = instrumentoRepository.save(instrumento);

                        // Crear historial de precio
                        Double precio = Double.parseDouble(instrumentoNode.get("precio").asText());
                        HistorialPrecioInstrumento historialPrecio = new HistorialPrecioInstrumento(instrumento, precio);
                        historialPrecioRepository.save(historialPrecio);

                        count++;
                    }

                    log.info("Se han cargado {} instrumentos desde el archivo JSON", count);
                } else {
                    log.error("No se encontró el array 'instrumentos' en el archivo JSON");
                }
            }
        } catch (IOException e) {
            log.error("Error al cargar instrumentos desde JSON: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Error inesperado al cargar instrumentos: {}", e.getMessage());
        }
    }

    private CategoriaInstrumento determinarCategoria(String nombreInstrumento) {
        String nombre = nombreInstrumento.toLowerCase();

        if (nombre.contains("guitarra") || nombre.contains("mandolina") || nombre.contains("violin")) {
            return categoriaRepository.findByDenominacion("Cuerda")
                    .orElseThrow(() -> new RuntimeException("Categoría Cuerda no encontrada"));
        } else if (nombre.contains("flauta") || nombre.contains("saxo") || nombre.contains("trompeta")) {
            return categoriaRepository.findByDenominacion("Viento")
                    .orElseThrow(() -> new RuntimeException("Categoría Viento no encontrada"));
        } else if (nombre.contains("batería") || nombre.contains("percusión") ||
                nombre.contains("pandereta") || nombre.contains("triangulo")) {
            return categoriaRepository.findByDenominacion("Percusión")
                    .orElseThrow(() -> new RuntimeException("Categoría Percusión no encontrada"));
        } else if (nombre.contains("piano") || nombre.contains("teclado") || nombre.contains("organo")) {
            return categoriaRepository.findByDenominacion("Teclado")
                    .orElseThrow(() -> new RuntimeException("Categoría Teclado no encontrada"));
        } else {
            return categoriaRepository.findByDenominacion("Varios")
                    .orElseThrow(() -> new RuntimeException("Categoría Varios no encontrada"));
        }
    }
}