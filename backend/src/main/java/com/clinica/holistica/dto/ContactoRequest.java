package com.clinica.holistica.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ContactoRequest {
    @NotBlank
    private String nombre;

    private String telefono;

    private String tipo;

    @NotBlank
    private String mensaje;
}
