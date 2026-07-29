package com.clinica.holistica.dto;

import lombok.Data;
import java.util.Map;

@Data
public class HistoriaRequest {
    // Todas las respuestas del formulario en un mapa clave → valor
    private Map<String, String> respuestas;

    // Si el usuario está autenticado se vincula automáticamente
    // Si no, se guarda con usuario null
    private Boolean consentimientoAceptado = false;
}
