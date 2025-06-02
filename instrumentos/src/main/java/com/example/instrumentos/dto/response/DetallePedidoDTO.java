package com.example.instrumentos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetallePedidoDTO {
    private Long id;
    private InstrumentoResponseDTO instrumento;
    private Integer cantidad;
    private Double precioUnitario;
    private Double subtotal;
}