package com.example.instrumentos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InstrumentoResponseDTO {
    private Long id;
    private String codigo;
    private String denominacion;
    private String marca;
    private Integer stock;
    private String descripcion;
    private String imagen;
    private Double precioActual;
    private String categoria;
    private Long categoriaId;
}
