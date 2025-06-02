package com.example.instrumentos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MercadoPagoResponseDTO {
    private String preferenceId;
    private String initPoint;
    private String sandboxInitPoint;
}