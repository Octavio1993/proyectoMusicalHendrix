package com.example.instrumentos.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaRequestDTO {
    @NotBlank(message = "La denominación es obligatoria")
    @Size(max = 50, message = "La denominación no puede exceder 50 caracteres")
    private String denominacion;
}